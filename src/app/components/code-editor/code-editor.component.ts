import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  forwardRef,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NG_ASYNC_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from '@angular/forms';
import { NgxEditorModel } from 'ngx-monaco-editor-v2';
import { BehaviorSubject, Observable, Subject, asyncScheduler, combineLatest, map, take } from 'rxjs';
import { EditorService, MonacoEditorOptions, getSchemaName } from 'src/app/services/editor.service';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrl: './code-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => CodeEditorComponent)
    },
    {
      provide: NG_ASYNC_VALIDATORS,
      multi: true,
      useExisting: forwardRef(() => CodeEditorComponent)
    }
  ]
})
export class CodeEditorComponent implements ControlValueAccessor, Validator {
  editorOptions$: Observable<MonacoEditorOptions>;

  instanceOptions$ = new BehaviorSubject<MonacoEditorOptions>({});

  codeEditorInitialized$ = new Subject<void>();

  code = new FormControl('');
  modelCode = new FormControl('');

  options$ = new BehaviorSubject<MonacoEditorOptions>({});
  _options: MonacoEditorOptions = {};
  @Input() set options(options: MonacoEditorOptions) {
    this._options = options;
    this.options$.next(options);
  }

  language$ = new BehaviorSubject<string>('');
  _language: string = '';
  @Input({ required: true }) set language(language: string) {
    this._language = language;
    this.language$.next(language);
  }

  model$ = new BehaviorSubject<string>('');
  _model: string = '';
  @Input({ required: true }) set model(model: string) {
    this._model = model;
    this.model$.next(model);
  }

  schema = signal<NgxEditorModel | null>(null);

  constructor(private editorService: EditorService, private cdr: ChangeDetectorRef) {
    this.editorOptions$ = combineLatest([
      this.editorService.getEditorOptions(),
      this.options$,
      this.instanceOptions$
    ]).pipe(
      map(([editorOptions, customOptions, instanceOptions]) => ({
        ...editorOptions,
        ...customOptions,
        ...instanceOptions
      }))
    );
    this.code.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => this.onChange(value));
    this.modelCode.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.schema.set({
        value,
        language: this._language,
        uri: getSchemaName(this._model)
      });
    });
  }

  @HostListener('document:keydown.alt.z') toggleSoftWrap() {
    if ((window as any).monaco) {
      if (this.instanceOptions$.getValue().wordWrap === 'bounded') {
        this.instanceOptions$.next({ ...this.instanceOptions$.getValue(), wordWrap: 'off' });
      } else {
        this.instanceOptions$.next({ ...this.instanceOptions$.getValue(), wordWrap: 'bounded' });
      }
    }
  }

  onChange = (value: any) => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {}

  writeValue(value: any): void {
    let code = value;
    switch (typeof value) {
      case 'string':
        try {
          code = JSON.parse(value);
          code = JSON.stringify(code, null, 2);
        } catch (err) {}
        break;
      case 'object':
        code = JSON.stringify(value, null, 2);
        break;
      default:
    }
    asyncScheduler.schedule(() => {
      this.code.setValue(code, { emitEvent: false });
      this.modelCode.setValue(code, { emitEvent: true });
      this.code.updateValueAndValidity();
      this.modelCode.updateValueAndValidity();
      this.cdr.markForCheck();
    });
  }

  updateValueFromModel(value: string) {
    this.code.setValue(value);
    this.code.updateValueAndValidity();
    this.cdr.markForCheck();
  }

  updateValidity() {
    this.code.updateValueAndValidity();
  }

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.language$.pipe(take(1)).pipe(
      map((language) => {
        switch (language) {
          case 'json':
            try {
              JSON.parse(this.code.value);
              return null;
            } catch (err) {
              return { invalid: true };
            }
        }
        return null;
      })
    );
  }

  onInitDone = false;

  @Output() intellisenseEnabled = new EventEmitter<boolean>();

  editor: any;
  onInit(editor) {
    if (!this.onInitDone) {
      this.onInitDone = true;
      if (this._model) {
        this.editorService.setMonacoEditorSchemas(this._model).then(() => {
          this.intellisenseEnabled.emit(true);
        });
      }
    }
  }
}
