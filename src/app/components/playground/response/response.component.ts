import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MonacoEditorConstructionOptions } from '@materia-ui/ngx-monaco-editor';
import { Store } from '@ngxs/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { IApiMethod, CustomHttpResponse } from 'src/app/interfaces';
import { LayoutService } from 'src/app/services/layout.service';
import { ViewState } from 'src/app/state/store';

@Component({
  selector: 'app-response',
  templateUrl: './response.component.html',
  styleUrls: ['./response.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResponseComponent implements OnChanges, OnInit {
  @Input() response: CustomHttpResponse;
  @Input() api: IApiMethod;

  loading$: Observable<boolean>;

  editorOptions$: Observable<MonacoEditorConstructionOptions>;

  code$ = new BehaviorSubject<string>('');

  html$ = new BehaviorSubject<SafeHtml>('');

  constructor(private _store: Store, private layout: LayoutService, private _sanitizer: DomSanitizer) {
    this.editorOptions$ = this.layout.getEditorOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.['response']?.currentValue) {
      // const previousResponse = (changes['response'].previousValue as IHttpResponse).body;
      const response = changes['response'].currentValue as CustomHttpResponse & HttpErrorResponse;
      const body = response.body;
      const html = response.error;
      if (body) {
        this.code$.next(typeof body === 'object' ? JSON.stringify(body, null, 2) : body);
        this.html$.next('');
      } else if (html) {
        this.code$.next('');
        this.html$.next(this._sanitizer.bypassSecurityTrustHtml(html));
      }
    }
  }

  ngOnInit() {
    this.loading$ = this._store.select(ViewState.GetTabLoadingStatus(this.api.id));
  }
}
