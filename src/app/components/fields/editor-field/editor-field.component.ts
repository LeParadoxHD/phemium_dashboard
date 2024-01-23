import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, Optional, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { MonacoEditorConstructionOptions } from '@materia-ui/ngx-monaco-editor';
import { Observable, Subscription } from 'rxjs';
import { LayoutService } from 'src/app/services/layout.service';

@Component({
  selector: 'app-editor-field',
  templateUrl: './editor-field.component.html',
  styleUrls: ['./editor-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorFieldComponent implements ControlValueAccessor, OnDestroy, OnInit {
  control = new FormControl('');
  disabled: boolean = false;
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

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    private _cdr: ChangeDetectorRef,
    private _layoutService: LayoutService
  ) {
    // Setting the value accessor directly (instead of using
    // the providers) to avoid running into a circular import.
    this.ngControl.valueAccessor = this;
    this.editorOptions$ = this._layoutService.getEditorOptions({
      readOnly: false,
      lineNumbers: 'on'
    });
  }

  sub: Subscription;
  ngOnInit() {
    this.sub = this.control.valueChanges.subscribe((val) => (this.value = val));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe?.();
  }

  writeValue(value: any) {
    // Expect a JSON formatted value
    this.value = value;
    this.onTouch();
    this.onChange(this.value);
    this.control.setValue(value, { emitEvent: false });
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

  editorOptions$: Observable<MonacoEditorConstructionOptions>;
}
