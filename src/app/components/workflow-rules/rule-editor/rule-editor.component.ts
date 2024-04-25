import { ChangeDetectionStrategy, Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR,
  Validators
} from '@angular/forms';
import { asapScheduler } from 'rxjs';
import { IWorkflowRule, Typed } from 'src/app/state/interfaces';

@Component({
  selector: 'app-rule-editor',
  templateUrl: './rule-editor.component.html',
  styleUrl: './rule-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: RuleEditorComponent
    }
  ]
})
export class RuleEditorComponent implements ControlValueAccessor {
  ruleForm: FormGroup<Typed<IWorkflowRule>>;

  _internalValue: IWorkflowRule;

  constructor(private formBuild: FormBuilder) {
    // Create form with default values
    this.ruleForm = this.formBuild.group<Typed<IWorkflowRule>>({
      description: this.formBuild.control('', Validators.minLength(10)),
      action: this.formBuild.control('', Validators.required),
      do: this.formBuild.control([]),
      load: this.formBuild.control({}),
      set: this.formBuild.control({}),
      where: this.formBuild.control({})
    });
    // Subcribe to UI form and update internal value
    this.ruleForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((rule) => this.onUiChange(rule));
  }

  writeValue(rule: IWorkflowRule) {
    asapScheduler.schedule(() => {
      this.ruleForm.patchValue(rule);
      this.ruleForm.updateValueAndValidity();
    });
  }

  // Use this method to update internal value from changes from UI
  onUiChange = (rule) => {
    this._internalValue = rule;
  };

  onUiTouched = () => {};

  registerOnChange(fn: any) {
    this.onUiChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onUiTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.ruleForm.disable();
    } else {
      this.ruleForm.enable();
    }
  }
}
