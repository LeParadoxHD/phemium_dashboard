import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, filter, map, switchMap } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { LayoutService, MonacoEditorOptions } from 'src/app/services/layout.service';
import { WorkflowRulesState } from 'src/app/state/store';

@Component({
  selector: 'app-workflow-rules-original',
  templateUrl: './workflow-rules-original.component.html',
  styleUrl: './workflow-rules-original.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowRulesOriginalComponent implements OnInit {
  editorOptions$: Observable<MonacoEditorOptions>;
  code$: Observable<string>;

  constructor(
    private store: Store,
    private layoutService: LayoutService,
    private commonService: CommonService
  ) {
    this.editorOptions$ = this.layoutService.getEditorOptions({
      lineNumbers: 'on',
      minimap: {
        enabled: true
      },
      guides: {
        indentation: true
      },
      copyWithSyntaxHighlighting: false
    });
  }

  ngOnInit() {
    this.code$ = this.commonService.currentEnvironment$.pipe(
      switchMap((env) => this.store.select(WorkflowRulesState.GetOriginalRules(env))),
      filter((rules) => !!rules),
      map((rules) => rules.string)
    );
  }
}
