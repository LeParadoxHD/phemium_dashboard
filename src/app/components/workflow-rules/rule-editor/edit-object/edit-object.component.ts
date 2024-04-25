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

@Component({
  selector: 'app-edit-object',
  templateUrl: './edit-object.component.html',
  styleUrl: './edit-object.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => EditObjectComponent)
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: forwardRef(() => EditObjectComponent)
    }
  ]
})
export class EditObjectComponent implements ControlValueAccessor, Validator {
  setForm: FormArray<FormGroup<Record<string, FormControl<string>>>>;

  constructor(private formBuild: FormBuilder, private cdr: ChangeDetectorRef) {
    this.setForm = this.formBuild.array<FormGroup>([]);
    this.setForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((values: Record<string, string>[]) => {
        const obj = values.reduce((r, a) => {
          r[a[0]] = a[1];
          return r;
        }, {});
        this.onUiChange(obj);
      });
  }

  deleteItem(i: number) {
    this.setForm.removeAt(i);
    this.setForm.updateValueAndValidity();
  }

  writeValue(values: Record<string, string>) {
    const controls: FormGroup<Record<string, FormControl<string>>>[] = [];
    for (const key in values) {
      controls.push(
        this.formBuild.group<Record<string, FormControl<string>>>({
          key: this.formBuild.control(key, Validators.required),
          value: this.formBuild.control(values[key], Validators.required)
        })
      );
    }
    this.setForm = this.formBuild.array(controls);
    this.setForm.updateValueAndValidity();
    this.cdr.markForCheck();
  }

  onUiChange = (values: Record<string, string>) => {};

  onUiTouched() {}

  registerOnChange(fn: any) {
    this.onUiChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onUiTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    if (isDisabled) {
      this.setForm.disable();
    } else {
      this.setForm.enable();
    }
  }

  add() {
    this.setForm.push(
      this.formBuild.group<Record<string, FormControl<string>>>({
        key: this.formBuild.control('', Validators.required),
        value: this.formBuild.control('', Validators.required)
      })
    );
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.setForm.valid ? null : { valid: false };
  }
}
