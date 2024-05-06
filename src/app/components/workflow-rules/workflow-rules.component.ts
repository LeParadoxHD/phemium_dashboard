import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
  runInInjectionContext
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngxs/store';
import { CommonService } from 'src/app/services/common.service';
import { WorkflowRulesActions } from 'src/app/state/actions';

@Component({
  selector: 'app-workflow-rules',
  templateUrl: './workflow-rules.component.html',
  styleUrl: './workflow-rules.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowRulesComponent implements OnInit {
  constructor(
    private store: Store,
    private injector: Injector,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    runInInjectionContext(this.injector, () => {
      this.commonService.currentEnvironment$
        .pipe(takeUntilDestroyed())
        .subscribe((env) => this.store.dispatch(new WorkflowRulesActions.GetRules(env)));
    });
  }
}
