import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { IApiMethod } from 'src/app/interfaces';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { ViewActions } from 'src/app/state/actions';
import { ViewState } from 'src/app/state/store';
import { SubSinkAdapter } from 'src/app/utilities';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-parameters',
  templateUrl: './parameters.component.html',
  styleUrls: ['./parameters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParametersComponent extends SubSinkAdapter implements OnInit {
  @Input() api: IApiMethod;

  loading$: Observable<boolean>;
  parametersForm: FormGroup;
  multipleTypes = this._fb.group({});

  constructor(private _fb: FormBuilder, private _store: Store) {
    super();
  }

  ngOnInit() {
    this.parametersForm = this._fb.group({
      parameters: this._fb.array(new Array(this.api.params.length).fill(null))
    });
    const valuesState = this._store.selectSnapshot(ViewState.GetTabParametersValue(this.api.id));
    if (Array.isArray(valuesState) && valuesState.length > 0) {
      const parameterControls = (this.parametersForm.get('parameters') as FormArray).controls;
      for (const [index, _] of parameterControls.entries()) {
        parameterControls.at(index).setValue(valuesState[index]);
      }
    }
    this.loading$ = this._store.select(ViewState.GetTabLoadingStatus(this.api.id));
    this.sink = this.parametersForm.valueChanges
      .pipe(
        debounceTime(500),
        map((values) => values.parameters),
        switchMap((parameters) => this._store.dispatch(new ViewActions.UpdateViewParameters(this.api.id, parameters)))
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
          this.multipleTypes.addControl(param.name, this._fb.control(null));
        }
        this.multipleTypes.get(param.name).setValue(values?.[param.name] || param.type[0], { emitEvent: false });
      }
    }

    this.sink = this.multipleTypes.valueChanges
      .pipe(
        debounceTime(100),
        switchMap((parameters) =>
          this._store.dispatch(new ViewActions.UpdateViewVirtualParameters(this.api.id, parameters))
        )
      )
      .subscribe();
  }

  send() {
    const parameters = this.parametersForm.get('parameters').getRawValue() as any[];
    this._store.dispatch(new ViewActions.PerformRequest(this.api.group.name, this.api.name, parameters));
  }
}
