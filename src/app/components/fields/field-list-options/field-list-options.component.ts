import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Optional, Self } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormArray, FormBuilder, FormGroup, NgControl } from '@angular/forms';
import { ListOptionsOperators } from 'src/app/config';

@Component({
  selector: 'app-field-list-options',
  templateUrl: './field-list-options.component.html',
  styleUrls: ['./field-list-options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldListOptionsComponent implements ControlValueAccessor {
  form: FormGroup;
  disabled: boolean = false;
  listOptionsOperators = ListOptionsOperators;
  _value: string;

  onChange: any = () => {};

  onTouch: any = () => {};

  get value() {
    return this._value;
  }

  // sets the value used by the ngModel of the element
  set value(value: string) {
    this._value = value;
    this.onChange(value);
    this.onTouch(value);
  }

  constructor(@Optional() @Self() public ngControl: NgControl, private _fb: FormBuilder, private _cdr: ChangeDetectorRef) {
    // Setting the value accessor directly (instead of using
    // the providers) to avoid running into a circular import.
    this.ngControl.valueAccessor = this;

    this.form = this._fb.group({
      page: null,
      rows_per_page: null,
      sort_column: '',
      sort_type: 'DESC',
      filters: this._fb.array([this.getFilterTemplate()])
    });
    this.form.get('sort_type').disable();
    this.form.valueChanges
      .pipe(
        //
        takeUntilDestroyed()
      )
      .subscribe((values) => (this.value = values));
    this.form
      .get('sort_column')
      .valueChanges.pipe(
        //
        takeUntilDestroyed()
      )
      .subscribe((val) => {
        if (val) {
          this.form.get('sort_type').enable();
          this.form.get('sort_type').setValue('DESC');
        } else {
          this.form.get('sort_type').disable();
          this.form.get('sort_type').setValue(null);
        }
        this.form.updateValueAndValidity();
      });
  }

  writeValue(value: any) {
    // Expect a JSON formatted value
    this.value = value;
    this.onTouch();
    this.onChange(this.value);
    this.form.patchValue(value, { emitEvent: false });
    this.form.updateValueAndValidity();
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

  getFilterTemplate() {
    return this._fb.group({
      column: '',
      operator: '',
      value: ''
    });
  }

  addFilter() {
    const filters = this.form.get('filters') as FormArray;
    filters.push(this.getFilterTemplate());
    this.form.updateValueAndValidity();
  }

  deleteFilter(index: number) {
    const filters = this.form.get('filters') as FormArray;
    filters.removeAt(index);
    this.form.updateValueAndValidity();
  }

  duplicateFilter(index: number) {
    const filters = this.form.get('filters') as FormArray;
    const filterValues = filters.at(index).value;
    filters.insert(index + 1, this.getFilterTemplate());
    filters.at(index + 1).patchValue(filterValues);
    this.form.updateValueAndValidity();
  }
}
