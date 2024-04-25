import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  forwardRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { asyncScheduler } from 'rxjs';
import { IApiMethodParams } from 'src/app/interfaces';
import { Typed } from 'src/app/state/interfaces';

export interface IParam {
  value: any;
  type: string;
  null: boolean;
  undefined: boolean;
}

@Component({
  selector: 'app-edit-parameters',
  templateUrl: './edit-parameters.component.html',
  styleUrl: './edit-parameters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => EditParametersComponent)
    }
  ]
})
export class EditParametersComponent implements ControlValueAccessor, OnChanges {
  @Input() params: IApiMethodParams[] = [];

  parametersForm: FormArray<FormGroup>;

  constructor(private formBuild: FormBuilder, private cdr: ChangeDetectorRef) {
    this.parametersForm = this.formBuild.array<FormGroup>([]);
    this.parametersForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((parameters: IParam[]) => {
        const values = parameters
          .filter((param) => !param.undefined)
          .map((param) => {
            if (param.null) {
              return null;
            }
            switch (param.type) {
              case 'integer':
              case 'int':
              case 'number':
                return parseInt(param.value, 10);
              case 'string':
                return typeof param.value === 'string' ? param.value : param.value.toString();
              case 'boolean':
              case 'bool':
                return typeof param.value === 'boolean' ? param.value : param.value === 'true';
              default:
                console.warn('unknown type:', param.type);
                return JSON.stringify(param.value);
            }
          });
        this.onUiChange(values);
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['params'].currentValue && this.parametersForm) {
      const controls: FormGroup<Typed<IParam>>[] = [];
      for (let i = 0; i < this.params.length; i++) {
        controls.push(
          this.formBuild.group<IParam>({
            value: '',
            type: this.params[i].type[0],
            null: false,
            undefined: false
          })
        );
      }
      this.parametersForm = this.formBuild.array(controls);
      this.parametersForm.updateValueAndValidity();
      this.cdr.markForCheck();
    }
  }

  registerOnChange(fn: any) {
    this.onUiChange = fn;
  }
  registerOnTouched(fn: any) {
    this.onUiTouched = fn;
  }

  writeValue(parameters: string[]): void {
    asyncScheduler.schedule(() => {
      const entries = parameters.entries();
      for (const [index, value] of entries) {
        this.updateControl(index, value);
      }
      const valuesLength = Object.keys(parameters).length;
      if (this.params && valuesLength < this.params.length) {
        for (let i = valuesLength; i < this.params.length; i++) {
          this.updateControl(i, undefined);
        }
      }
      this.parametersForm.updateValueAndValidity();
      this.cdr.markForCheck();
    });
  }

  updateControl(index: number, value: any) {
    const control = this.parametersForm.at(index);
    if (value === null) {
      control.get('null').setValue(true, { emitEvent: false });
      control.get('undefined').disable({ emitEvent: false });
      control.get('type').disable({ emitEvent: false });
      control.get('value').disable({ emitEvent: false });
      control.get('null').enable({ emitEvent: false });
    } else if (value === undefined) {
      control.get('undefined').setValue(true, { emitEvent: false });
      control.get('undefined').enable({ emitEvent: false });
      control.get('type').disable({ emitEvent: false });
      control.get('value').disable({ emitEvent: false });
      control.get('null').disable({ emitEvent: false });
    } else {
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      control.get('value').setValue(value, { emitEvent: false });
      control.get('undefined').enable({ emitEvent: false });
      control.get('value').enable({ emitEvent: false });
      control.get('null').enable({ emitEvent: false });
      control.get('type').enable({ emitEvent: false });
    }
    control.updateValueAndValidity();
  }

  onNullChange(checked: boolean, index: number) {
    const control = this.parametersForm.at(index);
    if (checked) {
      control.get('value').disable();
      control.get('undefined').disable();
      control.get('type').disable();
    } else {
      control.get('value').enable();
      control.get('undefined').enable();
      control.get('type').enable();
    }
  }

  onUndefinedChange(checked: boolean, index: number) {
    const control = this.parametersForm.at(index);
    if (checked) {
      control.get('value').disable();
      control.get('null').disable();
      control.get('type').disable();
    } else {
      control.get('value').enable();
      control.get('null').enable();
      control.get('type').enable();
    }
  }

  onUiChange = (parameters: string[]) => {};

  onUiTouched() {}

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.parametersForm.disable();
    } else {
      this.parametersForm.enable();
    }
  }
}
