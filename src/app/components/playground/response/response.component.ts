import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { IApiMethod, CustomHttpResponse } from 'src/app/interfaces';
import { EditorService, MonacoEditorOptions } from 'src/app/services/editor.service';
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

  editorOptions$: Observable<MonacoEditorOptions>;

  code$ = new BehaviorSubject<string>('');

  html$ = new BehaviorSubject<SafeHtml>('');

  constructor(private _store: Store, private editorService: EditorService, private _sanitizer: DomSanitizer) {
    this.editorOptions$ = this.editorService.getEditorOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.['response']?.currentValue) {
      // const previousResponse = (changes['response'].previousValue as IHttpResponse).body;
      const response = changes['response'].currentValue as CustomHttpResponse & HttpErrorResponse;
      if ('body' in response && response.body !== undefined) {
        const body = response.body as unknown;
        this.code$.next(typeof body === 'object' ? JSON.stringify(body, null, 2) : body.toString());
        this.html$.next('');
      } else if (typeof response.error === 'string') {
        this.code$.next('');
        this.html$.next(this._sanitizer.bypassSecurityTrustHtml(response.error));
      } else {
        this.code$.next('HttpErrorResponse: ' + JSON.stringify(response, null, 2));
        this.html$.next('');
      }
    }
  }

  ngOnInit() {
    this.loading$ = this._store.select(ViewState.GetTabLoadingStatus(this.api.id));
  }
}
