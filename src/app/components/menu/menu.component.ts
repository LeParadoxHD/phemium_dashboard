import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { NzSelectComponent } from 'ng-zorro-antd/select';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { ApisConfig } from 'src/app/config';
import { IApiMethod, IApiMethodGroup } from 'src/app/interfaces';
import { MethodActions, SettingsActions, ViewActions } from 'src/app/state/actions';
import { IApi, IEnvironmentsState, ILogin } from 'src/app/state/interfaces';
import { ApisState, EnvironmentsState, LoginsState, SettingsState } from 'src/app/state/store';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements OnInit {
  api$: Observable<IApi>;
  selectedEnvironment$: Observable<string>;
  methods$: Observable<IApiMethodGroup[]>;

  openMap: { [name: string]: boolean } = {};
  envControl = new FormControl(null);
  environment;
  availableApis = ApisConfig;

  @Select(EnvironmentsState) environments$: Observable<IEnvironmentsState>;
  @Select(LoginsState.GetCurrentLoginInfo()) loginInfo$: Observable<ILogin>;

  @ViewChild('envSelector') envSelector: NzSelectComponent;

  constructor(private _store: Store) {
    this.api$ = this._store.select(ApisState.GetApi('prerelease'));
    this.selectedEnvironment$ = this._store.select(SettingsState.GetProperty('selected_environment')).pipe(distinctUntilChanged());
    this.methods$ = this.api$.pipe(
      filter(Boolean),
      map((api) => api.apis)
    );
  }

  selectedEnvironment(envSlug: string) {
    this._store.dispatch(new SettingsActions.SetProperty('selected_environment', envSlug));
  }

  closeSelector() {
    this.envSelector.setOpenState(false);
  }

  openHandler(value: string): void {
    for (const key in this.openMap) {
      if (key !== value) {
        this.openMap[key] = false;
      }
    }
  }

  ngOnInit() {
    this._store.dispatch(new MethodActions.GetMethods('prerelease'));
    const currentEnvironment = this._store.selectSnapshot(SettingsState.GetProperty('selected_environment'));
    if (currentEnvironment) {
      this.envControl.setValue(currentEnvironment);
    }
  }

  addMethodToView(method: IApiMethod) {
    this._store.dispatch(new ViewActions.AddView(method));
  }
}
