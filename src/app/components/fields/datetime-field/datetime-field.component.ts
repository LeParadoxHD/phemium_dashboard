import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Optional,
  Self
} from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { format } from 'date-fns';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-datetime-field',
  templateUrl: './datetime-field.component.html',
  styleUrls: ['./datetime-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatetimeFieldComponent implements ControlValueAccessor {
  control = new FormControl('');
  disabled: boolean = false;
  _value: number;

  onChange: any = () => {};

  onTouch: any = () => {};

  get value() {
    return this._value;
  }

  // sets the value used by the ngModel of the element
  set value(value: number) {
    this._value = value;
    this.onChange(value);
    this.onTouch(value);
  }

  constructor(@Optional() @Self() public ngControl: NgControl, private _cdr: ChangeDetectorRef) {
    // Setting the value accessor directly (instead of using
    // the providers) to avoid running into a circular import.
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
    this.control.valueChanges.pipe(takeUntilDestroyed()).subscribe((val) => {
      this.value = Math.trunc(new Date(val).getTime() / 1000);
    });
  }

  writeValue(value: any) {
    // Expect a JSON formatted value
    this.value = value;
    this.onTouch();
    this.onChange(this.value);
    if (typeof value === 'number') {
      const unix = value * 1000;
      const date = new Date(unix);
      this.control.setValue(format(date, "yyyy-MM-dd'T'HH:mm"), { emitEvent: false });
      this.control.updateValueAndValidity();
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
    this._cdr.markForCheck();
  }
}
