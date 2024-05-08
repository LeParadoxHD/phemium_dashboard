import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { filter, map, switchMap } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { MonacoEditorOptions, MonacoModelError } from 'src/app/services/editor.service';
import { WorkflowRulesState } from 'src/app/state/store';
import { ValidationResult } from '../code-editor/code-editor.component';

@Component({
  selector: 'app-workflow-rules-original',
  templateUrl: './workflow-rules-original.component.html',
  styleUrl: './workflow-rules-original.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowRulesOriginalComponent {
  code = new FormControl(undefined);

  loading = signal(true);

  options: MonacoEditorOptions = {
    lineNumbers: 'on',
    readOnly: false,
    minimap: {
      enabled: true
    },
    guides: {
      indentation: true
    },
    copyWithSyntaxHighlighting: false
  };

  constructor(private store: Store, private commonService: CommonService, private cdr: ChangeDetectorRef) {
    this.commonService.currentEnvironment$
      .pipe(
        switchMap((env) => this.store.select(WorkflowRulesState.GetRulesState(env))),
        filter((rules) => !rules?.loading),
        filter((rules) => !!rules?.original?.json),
        map((rules) => rules.modified.json),
        takeUntilDestroyed()
      )
      .subscribe((code) => {
        this.code.setValue(code);
        this.loading.set(false);
        this.cdr.markForCheck();
      });
  }

  errors = signal<MonacoModelError[]>([]);
  warnings = signal<MonacoModelError[]>([]);
  valid = computed(() => {
    return this.errors().length === 0 && this.warnings().length === 0;
  });

  updateValidationState(result: ValidationResult) {
    if (Array.isArray(result.errors)) {
      this.errors.set(result.errors.filter((error) => error.severity > 4));
      this.warnings.set(result.errors.filter((error) => error.severity <= 4));
    } else {
      this.errors.set([]);
      this.warnings.set([]);
    }
  }

  save() {}
}
