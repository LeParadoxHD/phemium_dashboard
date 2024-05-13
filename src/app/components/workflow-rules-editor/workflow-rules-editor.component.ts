import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { BehaviorSubject, combineLatest, debounceTime, filter, map, pairwise, startWith, switchMap, tap } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { IWorkflowRule, IWorkflowRules } from 'src/app/state/interfaces';
import { WorkflowRulesState } from 'src/app/state/store';

@Component({
  selector: 'app-workflow-rules-editor',
  templateUrl: './workflow-rules-editor.component.html',
  styleUrl: './workflow-rules-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowRulesEditorComponent {
  rulesForm: FormArray<FormControl<IWorkflowRule>>;

  searchedRules = signal<FormControl[]>([]);

  rulesState = signal<IWorkflowRules>(null);

  rulesChanged = signal(false);

  pageIndex = signal(1);
  pageSize = signal(10);

  rules = signal<IWorkflowRule[]>([]);

  openState = signal({});

  search$ = new BehaviorSubject<string>('');

  constructor(private store: Store, private commonService: CommonService, private formBuild: FormBuilder) {
    this.rulesForm = this.formBuild.array([]);
    this.commonService.currentEnvironment$
      .pipe(
        switchMap((env) => this.store.select(WorkflowRulesState.GetRulesState(env))),
        tap((rules) => this.rulesState.set(rules)),
        filter((rules) => !rules?.loading),
        filter((rules) => !!rules?.original?.json),
        takeUntilDestroyed()
      )
      .subscribe((rules) => {
        this.rulesForm.clear();
        for (const rule of rules.original.json) {
          this.rulesForm.push(this.formBuild.control(rule));
        }
      });

    combineLatest([
      this.rulesForm.valueChanges.pipe(
        startWith(this.rulesForm.value),
        map(() => this.rulesForm.controls)
      ),
      this.search$.pipe(debounceTime(300), startWith(this.search$.getValue()))
    ])
      .pipe(
        map(([rules, search]: [FormControl<IWorkflowRule>[], string]) => {
          if (!search) {
            return [...rules];
          }
          search = search.toLowerCase();
          return rules.filter((rule) => {
            const stringToSearch = `${rule.value?.description}${rule.value?.action}`.toLowerCase();
            return stringToSearch.includes(search);
          });
        }),
        takeUntilDestroyed()
      )
      .subscribe((controls) => this.searchedRules.set(controls));
    this.rulesForm.valueChanges
      .pipe(
        //
        pairwise()
      )
      .subscribe(([previousValues, currentValues]) => {
        if (previousValues.length === currentValues.length) {
          this.rulesChanged.set(true);
        }
      });
  }

  changeOpenState(index: number, event: boolean) {
    this.openState.update((prev) => ({ ...prev, [index]: event }));
  }

  updateList(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.search$.next(value);
  }

  deleteRule(index: number, event: MouseEvent) {
    event.stopPropagation();
    this.rulesForm.removeAt(index);
    this.rulesForm.updateValueAndValidity();
  }

  submit() {}
}
