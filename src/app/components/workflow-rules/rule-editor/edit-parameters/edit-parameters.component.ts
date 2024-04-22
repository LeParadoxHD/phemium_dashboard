import {
  ChangeDetectionStrategy,
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
  FormControl,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

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
  @Input() slots: number = 0;

  parametersForm: FormArray<FormControl<string>>;

  constructor(private formBuild: FormBuilder) {
    this.parametersForm = this.formBuild.array<FormControl<string>>([]);
    this.parametersForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((parameters) => this.onUiChange(parameters));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['slots'].currentValue &&
      changes['slots'].previousValue !== changes['slots'].currentValue &&
      this.parametersForm
    ) {
      for (let i = 0; i < this.slots; i++) {
        this.parametersForm.push(new FormControl(''));
      }
    }
  }

  registerOnChange(fn: any) {
    this.onUiChange = fn;
  }
  registerOnTouched(fn: any) {
    this.onUiTouched = fn;
  }

  writeValue(parameters: string[]): void {
    for (const [index, value] of parameters.entries()) {
      this.parametersForm.at(index).setValue(value);
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
