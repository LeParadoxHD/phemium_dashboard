import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from '@angular/forms';
import { Typed } from 'src/app/state/interfaces';

@Component({
  selector: 'app-edit-load',
  templateUrl: './edit-load.component.html',
  styleUrl: './edit-load.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => EditLoadComponent)
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: forwardRef(() => EditLoadComponent)
    }
  ]
})
export class EditLoadComponent implements ControlValueAccessor, Validator {
  loadForm: FormGroup<Record<string, FormControl>>;

  constructor(private formBuild: FormBuilder, private cdr: ChangeDetectorRef) {
    this.loadForm = this.formBuild.group<Record<string, FormControl>>({});
    this.loadForm.valueChanges.pipe(takeUntilDestroyed()).subscribe((load) => {
      this.onUiChange(load);
    });
  }

  writeValue(load: Typed<Record<string, any>>) {
    for (const key in load) {
      if (this.loadForm.controls[key]) {
        this.loadForm.controls[key].patchValue(load[key]);
      } else {
        this.loadForm.addControl(key, this.formBuild.control(load[key]));
      }
    }
    this.loadForm.updateValueAndValidity();
    this.cdr.markForCheck();
  }

  onUiChange = (load: Typed<Record<string, any>>) => {};

  onUiTouched() {}

  registerOnChange(fn: any) {
    this.onUiChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onUiTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    if (isDisabled) {
      this.loadForm.disable();
    } else {
      this.loadForm.enable();
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.loadForm.valid ? null : { valid: false };
  }
}
