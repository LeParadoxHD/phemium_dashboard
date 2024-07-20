import { ChangeDetectionStrategy, Component, Injector, OnInit, runInInjectionContext, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngxs/store';
import { CommonService } from 'src/app/services/common.service';
import { ReportsActions } from 'src/app/state/actions';
import { ReportsService } from './reports.service';
import { FormControl, Validators } from '@angular/forms';
import { ReportsState, SettingsState } from 'src/app/state/store';
import { MonacoEditorOptions } from 'src/app/services/editor.service';
import { IDocument, PaginatedResponse } from 'src/app/state/interfaces';
import { LayoutService } from 'src/app/services/layout.service';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { ApiService, body } from 'src/app/services/api.service';
import { asyncScheduler, distinctUntilChanged, filter, switchMap } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { ValidationResult } from '../code-editor/code-editor.component';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent implements OnInit {
  constructor(
    private store: Store,
    private injector: Injector,
    private commonService: CommonService,
    public reportsService: ReportsService,
    public layout: LayoutService,
    private apiService: ApiService,
    private domSanitizer: DomSanitizer,
    private httpClient: HttpClient
  ) {}
  ngOnInit() {
    runInInjectionContext(this.injector, () => {
      this.commonService.currentEnvironment$
        .pipe(takeUntilDestroyed())
        .subscribe((env) => this.store.dispatch(new ReportsActions.GetReports(env)));
      this.commonService.currentEnvironment$
        .pipe(
          takeUntilDestroyed(),
          switchMap((env) => this.store.select(ReportsState.GetSelectedDocument(env)))
        )
        .subscribe((doc) => {
          if (doc) {
            this.documentCode.setValue(doc.content);
          }
        });
      this.consultationId.valueChanges
        .pipe(takeUntilDestroyed(), distinctUntilChanged(), filter(Boolean))
        .subscribe((id) => {
          localStorage.setItem('report_consultation_id', id);
        });
      this.enduserId.valueChanges
        .pipe(takeUntilDestroyed(), distinctUntilChanged(), filter(Boolean))
        .subscribe((id) => {
          localStorage.setItem('report_enduser_id', id);
          this.consultationId.setValue(null, { emitEvent: false });
          if (id) {
            this.loadingConsultations.set(true);
            this.apiService
              .request<PaginatedResponse<any>>({
                entity: 'consultations',
                method: 'get_consultations',
                parameters: [id, 2, false]
              })
              .pipe(body())
              .subscribe({
                next: (res) => {
                  this.consultations.set(res.items);
                },
                complete: () => {
                  this.loadingConsultations.set(false);
                }
              });
          }
        });
      if (localStorage.getItem('report_enduser_id')) {
        this.enduserId.setValue(+localStorage.getItem('report_enduser_id'));
      }
      if (localStorage.getItem('report_consultation_id')) {
        this.consultationId.setValue(+localStorage.getItem('report_consultation_id'));
      }
    });
    this.loadingEndusers.set(true);
    this.apiService
      .request<PaginatedResponse<any>>({
        entity: 'endusers',
        method: 'get_endusers'
      })
      .pipe(body())
      .subscribe({
        next: (res) => {
          this.endusers.set(res.items);
        },
        complete: () => {
          this.loadingEndusers.set(false);
        }
      });
  }

  onConsultationChange(id: number) {
    this.consultationId.setValue(id);
  }

  options: MonacoEditorOptions = {
    // @ts-ignore
    language: 'php',
    readOnly: false,
    lineNumbers: 'on',
    minimap: {
      enabled: true
    }
  };

  selectedDocument = signal<number>(null);

  selectDocument(document: IDocument) {
    this.selectedDocument.set(document.id);
    const doc = this.getSelectedDocument(document.id);
    this.documentCode.setValue(doc.content);
  }

  getSelectedDocument(documentId?: number) {
    documentId ||= this.selectedDocument();
    const environment = this.store.selectSnapshot(SettingsState.GetProperty('selected_environment'));
    const documents = this.store.selectSnapshot(ReportsState.GetDocuments(environment));
    const doc = documents.find((doc) => doc.id === documentId);
    return doc;
  }

  documentCode = new FormControl('');
  previewCode = signal('');

  loadingConsultations = signal(false);
  consultationId = new FormControl(null, Validators.required);
  loadingEndusers = signal(false);
  loadingPreview = signal(false);
  saving = signal(false);
  enduserId = new FormControl(null);

  endusers = signal<any[]>([]);
  consultations = signal<any[]>([]);

  previewUrl = signal<SafeResourceUrl>('');

  previewPanelId = -1;

  onPreviewPanelResize({ height }: NzResizeEvent, end: boolean): void {
    cancelAnimationFrame(this.previewPanelId);
    this.previewPanelId = requestAnimationFrame(() => {
      if (end) this.layout.previewReportPanelHeight$.next(height!);
      document.documentElement.style.setProperty('--preview-panel-height', `${height}px`);
      window.dispatchEvent(new Event('resize'));
    });
  }

  previewDocument() {
    if (this.consultationId.valid) {
      this.previewUrl.set('');
      this.adjustCodeEditorSize();
      this.loadingPreview.set(true);
      const doc = this.getSelectedDocument(this.selectedDocument());
      this.reportsService
        .runPreviewWithinConsultation(this.consultationId.value, {
          ...doc,
          content: this.documentCode.value
        })
        .then((reportItem) => {
          const pdfUrl = reportItem?.data?.resources_expanded?.[0]?.resource_url;
          if (pdfUrl) {
            return this.apiService.getPdf(pdfUrl);
          }
          return Promise.reject('Unable to retrieve PDF');
        })
        .then((url) => {
          this.previewUrl.set(this.domSanitizer.bypassSecurityTrustResourceUrl(url));
          this.adjustCodeEditorSize();
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          this.loadingPreview.set(false);
        });
    }
  }

  restoreOriginalDocument() {
    const doc = this.getSelectedDocument();
    this.documentCode.setValue(doc.content);
  }

  saveDocument() {
    const doc = this.getSelectedDocument();
    this.saving.set(true);
    this.reportsService
      .updateReport({
        ...doc,
        content: this.documentCode.value
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        this.saving.set(false);
      });
  }

  pdfValidated = signal(false);

  setPdfValidatedStatus(result: ValidationResult) {
    //this.pdfValidated.set(result.valid);
  }

  adjustCodeEditorSize() {
    asyncScheduler.schedule(() => window.dispatchEvent(new Event('resize')));
  }
}
