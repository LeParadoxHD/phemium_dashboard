import { Injectable } from '@angular/core';
import {
  Action,
  createSelector,
  NgxsOnChanges,
  NgxsOnInit,
  NgxsSimpleChange,
  Selector,
  State,
  StateContext,
  Store
} from '@ngxs/store';
import { Servers } from 'src/app/config';
import { LoginActions, SettingsActions } from '../actions';
import { ISettingsState } from '../interfaces';

/**
 * User based settings
 */
@State<ISettingsState>({
  name: 'settings',
  defaults: {}
})
@Injectable()
export class SettingsState implements NgxsOnChanges, NgxsOnInit {
  constructor(private _store: Store) {}

  @Action(SettingsActions.SetProperty)
  setProperty({ patchState }: StateContext<ISettingsState>, { property, value }: SettingsActions.SetProperty) {
    patchState({ [property]: value });
  }

  @Action(SettingsActions.SetProperties)
  setProperties({ patchState }: StateContext<ISettingsState>, { changes }: SettingsActions.SetProperties) {
    patchState(changes);
  }

  ngxsOnInit({ getState, dispatch }: StateContext<ISettingsState>) {
    const ctx = getState();
    if (ctx.selected_environment) {
      dispatch(new LoginActions.InitializeEnvironment(ctx.selected_environment));
    }
  }

  ngxsOnChanges(change: NgxsSimpleChange<ISettingsState>) {
    if (
      change.currentValue?.selected_environment &&
      change.previousValue?.selected_environment !== change.currentValue?.selected_environment
    ) {
      // Get Api and login_customer
      this._store.dispatch(new LoginActions.InitializeEnvironment(change.currentValue.selected_environment));
    }
  }

  @Selector()
  static GetCurrentEnvironment(ctx: ISettingsState) {
    return ctx.selected_environment;
  }

  static GetProperty(property: keyof ISettingsState) {
    return createSelector([SettingsState], (settings) => settings[property]);
  }

  @Selector()
  static GetCurrentEnvironmentServer(ctx: ISettingsState) {
    if (typeof ctx.selected_environment === 'string') {
      return ctx.selected_environment.split('|')[0] as Servers;
    }
    return null;
  }
}
