import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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

  constructor(private _store: Store, private layout: LayoutService) {
    this.editorOptions$ = this.layout.getEditorOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.['response']?.currentValue) {
      // const previousResponse = (changes['response'].previousValue as IHttpResponse).body;
      const currentResponse = (changes['response'].currentValue as CustomHttpResponse).body;
      this.code$.next(typeof currentResponse === 'object' ? JSON.stringify(currentResponse, null, 2) : currentResponse);
    }
  }

  ngOnInit() {
    this.loading$ = this._store.select(ViewState.GetTabLoadingStatus(this.api.id));
  }
}
