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
import { Typed } from 'src/app/state/interfaces';

interface ArrayItem {
  key: FormControl<string>;
  value: FormControl<any>;
}

interface Item {
  key: string;
  value: any;
}

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
  loadForm: FormArray<FormGroup<ArrayItem>>;

  constructor(private formBuild: FormBuilder, private cdr: ChangeDetectorRef) {
    this.loadForm = this.formBuild.array<FormGroup<ArrayItem>>([]);
    this.loadForm.valueChanges.pipe(takeUntilDestroyed()).subscribe((values: Item[]) => {
      const obj = values.reduce((r, a) => {
        r[a.key] = a.value;
        return r;
      }, {});
      this.onUiChange(obj);
    });
  }

  writeValue(load: Typed<Record<string, any>>) {
    const controls: FormGroup<ArrayItem>[] = [];
    for (const key in load) {
      controls.push(
        this.formBuild.group<ArrayItem>({
          key: this.formBuild.control(key),
          value: this.formBuild.control(load[key])
        })
      );
    }
    this.loadForm = this.formBuild.array(controls);
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

  add() {
    this.loadForm.push(
      this.formBuild.group({
        key: this.formBuild.control(''),
        value: this.formBuild.control({})
      })
    );
  }

  remove(index: number) {
    this.loadForm.removeAt(index);
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.loadForm.valid ? null : { valid: false };
  }
}
