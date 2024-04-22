import { ChangeDetectionStrategy, Component, Optional, Self, signal } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { LayoutService, MonacoEditorOptions } from 'src/app/services/layout.service';

@Component({
  selector: 'app-editor-field',
  templateUrl: './editor-field.component.html',
  styleUrls: ['./editor-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorFieldComponent implements ControlValueAccessor {
  control = signal('');
  disabled = signal(false);
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

  constructor(@Optional() @Self() public ngControl: NgControl, private _layoutService: LayoutService) {
    // Setting the value accessor directly (instead of using
    // the providers) to avoid running into a circular import.
    this.ngControl.valueAccessor = this;
    this.editorOptions$ = this._layoutService.getEditorOptions({
      readOnly: false,
      lineNumbers: 'on'
    });
  }

  onCodeChange(value: string) {
    try {
      value = JSON.parse(value.replace(/\r|\n|\t/g, ''));
    } catch (err) {}
    this.value = value;
  }

  writeValue(value: any) {
    // Expect a JSON formatted value
    this.value = value;
    this.onTouch();
    this.onChange(this.value);
    if (typeof value !== 'string') {
      this.control.set(JSON.stringify(value, null, 2));
    } else {
      this.control.set(value);
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled.set(isDisabled);
  }

  editorOptions$: Observable<MonacoEditorOptions>;
}
