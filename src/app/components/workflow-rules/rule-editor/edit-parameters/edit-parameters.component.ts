import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewContainerRef,
  forwardRef
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { asyncScheduler } from 'rxjs';
import { JsonEditorComponent, JsonEditorPayload } from 'src/app/components/json-editor/json-editor.component';
import { IApiMethodParams } from 'src/app/interfaces';
import { Typed } from 'src/app/state/interfaces';
import { ErrorAnimation } from '../utils/animations';
import { SubSinkAdapter } from 'src/app/utilities';
import { ParameterValidator } from '../utils/validators';
import { parseParameter } from '../utils/parsers';
import { updateControlState } from '../utils/automations';

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
  animations: [ErrorAnimation],
  providers: [
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: forwardRef(() => EditParametersComponent)
    },
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => EditParametersComponent)
    }
  ]
})
export class EditParametersComponent extends SubSinkAdapter implements ControlValueAccessor, OnChanges, Validator {
  @Input() params: IApiMethodParams[] = [];

  parametersForm: FormArray<FormGroup>;

  constructor(
    private formBuild: FormBuilder,
    private cdr: ChangeDetectorRef,
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef
  ) {
    super();
    this.parametersForm = this.formBuild.array<FormGroup>([]);
    this.resubscribeParametersForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['params'].currentValue && this.parametersForm) {
      const controls: FormGroup<Typed<IParam>>[] = [];
      for (let i = 0; i < this.params.length; i++) {
        controls.push(
          this.formBuild.group<IParam>(
            {
              value: this.formBuild.control(''),
              type: this.params[i].type[0],
              null: false,
              undefined: false
            },
            { validators: ParameterValidator() }
          )
        );
      }
      this.parametersForm = this.formBuild.array(controls);
      this.parametersForm.updateValueAndValidity();
      this.resubscribeParametersForm();
      this.cdr.markForCheck();
    }
  }

  resubscribeParametersForm() {
    this.sink = this.parametersForm.valueChanges.subscribe((parameters: IParam[]) => {
      const values = parameters.filter((param) => !param.undefined).map(parseParameter);
      this.onUiChange(values);
    });
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
    updateControlState(control, value);
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
      // TODO: Fix entering blocked state when checking null checkbox and then any undefined checkbox above
      if (!control.get('value').disabled) control.get('value').disable();
      if (!control.get('null').disabled) control.get('null').disable();
      if (!control.get('type').disabled) control.get('type').disable();
      if (this.parametersForm.at(index + 1)) {
        this.parametersForm
          .at(index + 1)
          .get('undefined')
          .setValue(true, { emitEvent: true });
        this.onUndefinedChange(true, index + 1);
      }
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

  openJsonEditor(event: MouseEvent, index: number) {
    event.preventDefault();
    event.stopPropagation();
    const paramType = this.parametersForm.at(index)?.get('type')?.value;
    const primitiveTypes = ['bool', 'boolean', 'number', 'string', 'int', 'integer', 'float'];
    if (!primitiveTypes.includes(paramType)) {
      const modal = this.modal.create<JsonEditorComponent, JsonEditorPayload>({
        nzTitle: 'Edit JSON',
        nzContent: JsonEditorComponent,
        nzViewContainerRef: this.viewContainerRef,
        nzData: {
          code: this.parametersForm.at(index).get('value').value,
          model: this.parametersForm.at(index).get('type').value
        },
        nzWidth: window.innerWidth > 800 ? '800px' : '90%',
        nzBodyStyle: {
          minHeight: '400px',
          height: '20vh'
        }
      });
      modal.afterClose.subscribe((result) => {
        if (result !== undefined) {
          this.parametersForm.at(index).get('value').setValue(JSON.stringify(result));
        }
      });
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.parametersForm.valid ? null : { invalid: true };
  }
}
