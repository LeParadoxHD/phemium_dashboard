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
import { map } from 'rxjs';
import { Typed } from 'src/app/state/interfaces';
import { SubSinkAdapter } from 'src/app/utilities';

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
export class EditLoadComponent extends SubSinkAdapter implements ControlValueAccessor, Validator {
  loadForm: FormArray<FormGroup<ArrayItem>>;

  constructor(private formBuild: FormBuilder, private cdr: ChangeDetectorRef) {
    super();
    this.loadForm = this.formBuild.array<FormGroup<ArrayItem>>([]);
    this.resubscribeLoadForm();
  }

  transform(items: Item[]): Record<string, any> {
    return items.reduce((r, a) => {
      r[a.key] = a.value;
      return r;
    }, {});
  }

  writeValue(load: Typed<Record<string, any>>) {
    const controls: FormGroup<ArrayItem>[] = [];
    for (const key in load) {
      controls.push(
        this.formBuild.group<ArrayItem>({
          key: this.formBuild.control(key, Validators.required),
          value: this.formBuild.control(load[key])
        })
      );
    }
    this.loadForm = this.formBuild.array(controls);
    this.loadForm.updateValueAndValidity();
    this.resubscribeLoadForm();
    this.cdr.markForCheck();
  }

  resubscribeLoadForm() {
    this.sink = this.loadForm.valueChanges
      .pipe(
        //
        map(this.transform)
      )
      .subscribe((values) => this.onUiChange(values));
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
        key: this.formBuild.control('', Validators.required),
        value: this.formBuild.control({})
      })
    );
  }

  remove(index: number) {
    this.loadForm.removeAt(index);
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.loadForm.valid ? null : { invalid: true };
  }
}
