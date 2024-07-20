import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  input,
  OnInit,
  Output,
  forwardRef,
  computed,
  NgZone
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from '@angular/forms';
import { NgxEditorModel } from 'ngx-monaco-editor-v2';
import {
  BehaviorSubject,
  Observable,
  asyncScheduler,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  startWith
} from 'rxjs';
import {
  EditorService,
  InferSchemaSource,
  MonacoEditor,
  MonacoEditorOptions,
  MonacoModelError,
  SchemaSource,
  SetMonacoModelOptions,
  getSchemaName
} from 'src/app/services/editor.service';
import { SubSinkAdapter } from 'src/app/utilities';

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
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: forwardRef(() => CodeEditorComponent)
    }
  ]
})
// TODO: AutoSize Code Editor
export class CodeEditorComponent extends SubSinkAdapter implements ControlValueAccessor, Validator, OnInit {
  editorOptions$: Observable<MonacoEditorOptions>;

  instanceOptions$ = new BehaviorSubject<MonacoEditorOptions>({});

  code = new FormControl('');
  modelCode = new FormControl(undefined);

  options = input<MonacoEditorOptions>();
  model = input<string>();

  modelUri = computed(() => {
    const monaco = this.editorService.getMonaco();
    const inferredSchema = InferSchemaSource(this.model());
    return monaco.Uri.parse(getSchemaName(inferredSchema.source, inferredSchema.name));
  });

  @Input({ required: true }) language: string;

  schema$ = new BehaviorSubject<NgxEditorModel | null>(null);

  constructor(private editorService: EditorService, private cdr: ChangeDetectorRef, private ngZone: NgZone) {
    super();
    this.editorOptions$ = combineLatest([
      this.editorService.getEditorOptions(),
      toObservable(this.options),
      this.instanceOptions$
    ]).pipe(
      map(([editorOptions, customOptions, instanceOptions]) => ({
        ...editorOptions,
        ...customOptions,
        ...instanceOptions
      }))
    );
    this.code.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      try {
        const parsed = JSON.parse(value);
        this.onChange(parsed);
      } catch (err) {
        this.onChange(value);
      }
    });
  }

  @HostListener('document:keydown.alt.z') toggleSoftWrap() {
    if (this.instanceOptions$.getValue().wordWrap === 'bounded') {
      this.instanceOptions$.next({ ...this.instanceOptions$.getValue(), wordWrap: 'off' });
    } else {
      this.instanceOptions$.next({ ...this.instanceOptions$.getValue(), wordWrap: 'bounded' });
    }
  }

  onChange = (value: any) => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {}

  writeValue(value: any): void {
    let code = value === 'null' ? '' : value;
    if (code) {
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
    }
    asyncScheduler.schedule(() => {
      this.code.setValue(code, { emitEvent: false });
      this.modelCode.setValue(code, { emitEvent: true });
      this.code.updateValueAndValidity();
      this.modelCode.updateValueAndValidity();
      this.cdr.markForCheck();
      asyncScheduler.schedule(() => {
        this.editorService.getMonaco().editor.remeasureFonts();
      });
    });
  }

  updateValueFromModel(value: string) {
    this.code.setValue(value);
    this.code.updateValueAndValidity();
    this.cdr.markForCheck();
    asyncScheduler.schedule(() => {
      this.editorService.getMonaco().editor.remeasureFonts();
    });
  }

  updateValidity() {
    this.code.updateValueAndValidity();
  }

  validate(control: AbstractControl): ValidationErrors | null {
    switch (this.language) {
      case 'json':
        try {
          JSON.parse(this.code.value);
          return null;
        } catch (err) {
          return { invalid: true };
        }
    }
    return null;
  }

  @Output() onValidated = new EventEmitter<ValidationResult>();
  @Output() intellisenseEnabled = new EventEmitter<boolean>();

  async ngOnInit() {
    let diagnosticsOptions: SetMonacoModelOptions | null = null;
    if (this.model()) {
      const schemaSource = InferSchemaSource(this.model());
      switch (schemaSource.source) {
        case SchemaSource.ApiEntity:
          diagnosticsOptions = {
            source: SchemaSource.ApiEntity,
            name: schemaSource.name
          };
          break;
        case SchemaSource.External:
          const name = this.model().replace('external:', '');
          diagnosticsOptions = {
            source: SchemaSource.External,
            name: schemaSource.name,
            uri: `${location.protocol}//${location.host}/assets/schemas/json/${name}.json`
          };
          break;
        case SchemaSource.Static:
          throw new Error('Not implemented');
      }
      if (diagnosticsOptions) {
        await this.editorService
          .setMonacoEditorSchemas(diagnosticsOptions)
          .then(() => this.intellisenseEnabled.emit(true))
          .catch((err) => {
            console.error(err);
            this.intellisenseEnabled.emit(false);
          });
      }
      this.sink = this.modelCode.valueChanges
        .pipe(
          startWith(this.modelCode.value),
          filter((value) => value !== undefined && value !== null),
          distinctUntilChanged(),
          map((value) => {
            const monaco = this.editorService.getMonaco();
            const schema: NgxEditorModel = {
              value,
              language: this.language,
              uri: monaco.Uri.parse(getSchemaName(schemaSource.source, schemaSource.name))
            };
            return schema;
          })
        )
        .subscribe((schema) => this.schema$.next(schema));
    }
  }

  editorInstance: MonacoEditor;

  onEditorInit(editor: MonacoEditor, withSchema: boolean) {
    this.editorInstance = editor;
    this.editorService.getMonaco().editor.remeasureFonts();
    if (withSchema) {
      this.sink = new Observable((observer) => {
        const modelUri = this.modelUri();
        const monaco = this.editorService.getMonaco();
        monaco.editor.onDidChangeMarkers((e) => {
          const instanceMarkers = e.filter((e) => e.toString() === modelUri.toString());
          if (instanceMarkers.length > 0) {
            observer.next(e);
          } else if (e.length === 0) {
            observer.next();
          }
        });
      }).subscribe(() => this.checkModelMarkers());
    }
  }

  checkModelMarkers() {
    const monaco = this.editorService.getMonaco();
    const markers = monaco.editor.getModelMarkers({
      resource: this.modelUri()
    });
    this.ngZone.run(() => {
      this.onValidated.emit({ valid: markers.length === 0, errors: markers });
    });
  }
}

export interface ValidationResult {
  valid: boolean;
  errors?: MonacoModelError[];
}
