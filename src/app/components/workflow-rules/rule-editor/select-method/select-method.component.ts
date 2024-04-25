import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Input,
  OnChanges,
  SimpleChanges,
  forwardRef
} from '@angular/core';
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
  Validator,
  Validators
} from '@angular/forms';
import { Observable, distinctUntilChanged, map, pairwise, tap } from 'rxjs';
import { IApiMethodGroup } from 'src/app/interfaces';
import { CommonService } from 'src/app/services/common.service';
import { Typed } from 'src/app/state/interfaces';

interface ITrigger {
  api: string;
  method: string;
  parameters?: any[];
}

@Component({
  selector: 'app-select-method',
  templateUrl: './select-method.component.html',
  styleUrl: './select-method.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => SelectMethodComponent)
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SelectMethodComponent),
      multi: true
    }
  ]
})
export class SelectMethodComponent implements ControlValueAccessor, Validator, OnChanges {
  @Input() composeAsString = true;
  @Input() name?: FormControl<string>;
  @Input() @HostBinding('class.parameters-mode') enableParameters = false;

  triggerForm: FormGroup<Typed<ITrigger>>;

  apis$: Observable<IApiMethodGroup[]> = this.commonService.currentApiItems$;

  constructor(
    private formBuild: FormBuilder,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef
  ) {
    // Create form with default values
    this.triggerForm = this.formBuild.group<Typed<ITrigger>>({
      api: this.formBuild.control('', Validators.required),
      method: this.formBuild.control('', Validators.required)
    });
    // Subcribe to UI form and update internal value
    this.triggerForm.valueChanges
      .pipe(
        takeUntilDestroyed(),
        tap((values) => {
          const method = `${values.api}__${values.method}`;
          this.onUiChange(method);
        }),
        map((values) => values.api),
        distinctUntilChanged(),
        pairwise()
      )
      .subscribe(([previousApi, currentApi]) => {
        if (currentApi && previousApi) {
          this.triggerForm.get('method').enable({ emitEvent: false });
          this.triggerForm.patchValue({ method: '' }, { emitEvent: false });
          this.triggerForm.updateValueAndValidity();
          this.cdr.markForCheck();
        } else if (!currentApi) {
          this.triggerForm.get('method').disable({ emitEvent: false });
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['enableParameters'].currentValue) {
      if (this.enableParameters) {
        this.triggerForm.addControl('parameters', this.formBuild.control([]));
      } else {
        this.triggerForm.removeControl('parameters');
      }
    }
  }

  writeValue(_method: string | ITrigger) {
    if (_method) {
      let api: string = null;
      let method: string = null;
      let parameters: any[] = [];
      if (this.composeAsString && typeof _method === 'string') {
        [api, method] = _method.split('__');
      } else if (!this.composeAsString && typeof _method === 'object') {
        api = _method.api;
        method = _method.method;
        if (this.enableParameters) {
          parameters = _method.parameters;
        }
      }
      if (api && method) {
        this.triggerForm.patchValue({ api, method }, { emitEvent: false });
        if (this.enableParameters) {
          this.triggerForm.patchValue({ parameters }, { emitEvent: false });
        }
        this.triggerForm.updateValueAndValidity();
        this.cdr.markForCheck();
      }
    }
  }

  // Use this method to update internal value from changes from UI
  onUiChange = (method: string) => {};

  onUiTouched = () => {};

  registerOnChange(fn: any) {
    this.onUiChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onUiTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.triggerForm.disable();
    } else {
      this.triggerForm.enable();
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (this.triggerForm.get('api').invalid || this.triggerForm.get('method').invalid) {
      return { invalid: true };
    }
    return null;
  }
}
