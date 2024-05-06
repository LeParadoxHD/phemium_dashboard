import { ChangeDetectionStrategy, Component, Input, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IViewRequest } from 'src/app/interfaces';
import { EditorService, MonacoEditorOptions } from 'src/app/services/editor.service';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestComponent {
  @Input() request: IViewRequest;

  editorOptions$: Observable<MonacoEditorOptions>;

  constructor(private editorService: EditorService) {
    this.editorOptions$ = this.editorService.getEditorOptions();
  }

  code$ = new BehaviorSubject<string>('');

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.['request']?.currentValue) {
      // const previousResponse = (changes['request'].previousValue as IHttpResponse).body;
      const parameters = (changes['request'].currentValue as IViewRequest).parameters as any[];
      if (Array.isArray(parameters)) {
        const convertedParams = parameters.reduce((r, a, index) => {
          try {
            r[index] = JSON.parse(a);
          } catch (err) {
            r[index] = a;
          }
          return r;
        }, {});
        this.code$.next(JSON.stringify(convertedParams, null, 2));
      }
    }
  }
}
