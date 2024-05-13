import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Input,
  OnInit,
  computed,
  runInInjectionContext,
  signal
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { IApiMethod } from 'src/app/interfaces';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { ViewActions } from 'src/app/state/actions';
import { ViewState } from 'src/app/state/store';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ValidationResult } from '../../code-editor/code-editor.component';
import { MonacoModelError } from 'src/app/services/editor.service';
import { IsPrimitivePipe } from 'src/app/pipes/is-primitive.pipe';

@Component({
  selector: 'app-parameters',
  templateUrl: './parameters.component.html',
  styleUrls: ['./parameters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [IsPrimitivePipe]
})
export class ParametersComponent implements OnInit {
  @Input() api: IApiMethod;

  loading$: Observable<boolean>;
  parametersForm: FormGroup;
  multipleTypes = this._fb.group({});

  intellisenseStatus = signal<Record<string, boolean>>({});
  setIntellisenseStatus(key: string, status: boolean) {
    this.intellisenseStatus.update((state) => ({ ...state, [key]: status }));
  }

  schemasStatus = signal<Record<string, MonacoModelError[]>>({});
  isOneSchemaInvalid = computed(() => {
    return Object.values(this.schemasStatus()).some((s) => s?.length > 0);
  });
  setSchemaErrors(key: string, result: ValidationResult) {
    if (result.errors?.length > 0) {
      this.schemasStatus.update((state) => ({ ...state, [key]: result.errors }));
    } else {
      this.schemasStatus.update((state) => ({ ...state, [key]: null }));
    }
  }

  constructor(
    private _fb: FormBuilder,
    private _store: Store,
    private injector: Injector,
    private isPrimitive: IsPrimitivePipe
  ) {}

  ngOnInit() {
    runInInjectionContext(this.injector, () => {
      const emptyArray = this.api.params.map((item, index) => {
        if (Array.isArray(item.type) && item.type.length === 1 && !this.isPrimitive.transform(item.type[0])) {
          return '';
        }
        return null;
      });
      this.parametersForm = this._fb.group({
        parameters: this._fb.array(emptyArray)
      });
      const valuesState = this._store.selectSnapshot(ViewState.GetTabParametersValue(this.api.id));
      if (Array.isArray(valuesState) && valuesState.length > 0) {
        const parameterControls = (this.parametersForm.get('parameters') as FormArray).controls;
        for (const [index, _] of parameterControls.entries()) {
          parameterControls.at(index).setValue(valuesState[index] || '');
        }
      }
      this.loading$ = this._store.select(ViewState.GetTabLoadingStatus(this.api.id));
      this.parametersForm.valueChanges
        .pipe(
          debounceTime(500),
          map((values) => values.parameters),
          switchMap((parameters) =>
            this._store.dispatch(new ViewActions.UpdateViewParameters(this.api.id, parameters))
          ),
          takeUntilDestroyed()
        )
        .subscribe();
      // Analyze if some parameter has multiple types,
      // in that case create an object storing the type
      const values = this._store.selectSnapshot<Record<string, any> | null>(
        ViewState.GetTabVirtualParameters(this.api.id)
      );
      for (const param of this.api.params) {
        if (param.type.length > 1) {
          if (!this.multipleTypes.contains(param.name)) {
            this.multipleTypes.addControl(param.name, this._fb.control(''));
          }
          this.multipleTypes.get(param.name).setValue(values?.[param.name] || param.type[0], { emitEvent: false });
        }
      }

      this.multipleTypes.valueChanges
        .pipe(
          debounceTime(100),
          switchMap((parameters) =>
            this._store.dispatch(new ViewActions.UpdateViewVirtualParameters(this.api.id, parameters))
          ),
          takeUntilDestroyed()
        )
        .subscribe();
    });
  }

  send() {
    const parameters = this.parametersForm.get('parameters').getRawValue() as any[];
    this._store.dispatch(new ViewActions.PerformRequest(this.api.group.name, this.api.name, parameters));
  }
}
