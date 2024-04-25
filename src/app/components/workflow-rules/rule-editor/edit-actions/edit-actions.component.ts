import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  Validators
} from '@angular/forms';
import { IWorkflowRuleAction, Typed } from 'src/app/state/interfaces';

@Component({
  selector: 'app-edit-actions',
  templateUrl: './edit-actions.component.html',
  styleUrl: './edit-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => EditActionsComponent)
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: forwardRef(() => EditActionsComponent)
    }
  ]
})
export class EditActionsComponent implements ControlValueAccessor, Validator {
  actionsForm: FormArray<FormControl<IWorkflowRuleAction>>;

  constructor(private formBuild: FormBuilder, private cdr: ChangeDetectorRef) {
    this.actionsForm = this.formBuild.array<FormControl<IWorkflowRuleAction>>([]);
    this.actionsForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((values) => this.onUiChange(values));
  }

  writeValue(actions: IWorkflowRuleAction[]) {
    const controls: FormControl<IWorkflowRuleAction>[] = [];
    for (const action of actions) {
      controls.push(this.formBuild.control(action));
    }
    this.actionsForm = this.formBuild.array(controls);
    this.actionsForm.updateValueAndValidity();
    this.cdr.markForCheck();
  }

  onUiChange = (actions: IWorkflowRuleAction[]) => {};

  onUiTouched() {}

  registerOnChange(fn: any) {
    this.onUiChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onUiTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    if (isDisabled) {
      this.actionsForm.disable();
    } else {
      this.actionsForm.enable();
    }
  }

  add() {
    this.actionsForm.push(this.formBuild.control<IWorkflowRuleAction>(null));
    this.cdr.markForCheck();
  }

  remove(index: number) {
    this.actionsForm.removeAt(index);
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.actionsForm.valid ? null : { valid: false };
  }
}
