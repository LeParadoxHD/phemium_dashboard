import { Injectable } from '@angular/core';
import { Action, createSelector, State, StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { ApiService } from 'src/app/services/api.service';
import { LoginActions, MethodActions } from '../actions';
import { ILogin, ILoginsState, ISettingsState } from '../interfaces';
import { SettingsState } from './settings.store';
import { tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Servers } from 'src/app/config';

@State<ILoginsState>({
  name: 'logins',
  defaults: {}
})
@Injectable()
export class LoginsState {
  constructor(private _api: ApiService) {}

  ngxsOnInit({ getState, setState }: StateContext<ILoginsState>) {
    const ctx = { ...getState() };
    for (const environment in ctx) {
      ctx[environment].loading = false;
    }
    setState(ctx);
  }

  @Action(LoginActions.InitializeEnvironment)
  initializeEnvironment(
    { getState, setState, dispatch }: StateContext<ILoginsState>,
    { environment }: LoginActions.InitializeEnvironment
  ) {
    const ctx = getState();
    if (!(environment in ctx)) {
      setState(patch<ILoginsState>({ [environment]: {} }));
    }
    const [server, _] = environment.split('|') as [Servers, string];
    dispatch([new MethodActions.GetMethods(server), new LoginActions.LoginCustomer(environment)]);
  }

  @Action(LoginActions.LoginCustomer)
  loginCustomer(
    { getState, setState, dispatch }: StateContext<ILoginsState>,
    { environment, force }: LoginActions.LoginCustomer
  ) {
    const ctx = getState();
    let token: string = null;
    if (environment in ctx) {
      token = ctx[environment].token;
    } else {
      setState(patch<ILoginsState>({ [environment]: {} }));
    }
    const [server, name] = environment.split('|') as [Servers, string];
    dispatch(new MethodActions.GetMethods(server));

    if (token && !force) {
      // Validate the token and re-login if necessary
      return of(null);
    }
    // Perform Login as Customer
    setState(patch<ILoginsState>({ [environment]: patch<ILogin>({ loading: true }) }));
    return this._api.loginCustomer(environment).pipe(
      tap((response) => {
        if (response.ok && response.body) {
          const token = response.body as string;
          setState(
            patch<ILoginsState>({
              [environment]: patch<ILogin>({ loading: false, token, valid: true })
            })
          );
        }
      })
    );
  }

  @Action(LoginActions.SetToken)
  setToken(
    { getState, setState, dispatch }: StateContext<ILoginsState>,
    { environment }: LoginActions.SetToken
  ) {
    const ctx = getState();
    if (!(environment in ctx)) {
      setState(patch<ILoginsState>({ [environment]: {} }));
    }
    const [server, _] = environment.split('|') as [Servers, string];
    dispatch([new MethodActions.GetMethods(server), new LoginActions.LoginCustomer(environment)]);
  }

  static GetCurrentToken() {
    return createSelector(
      [LoginsState, SettingsState],
      (loginState: ILoginsState, settingsState: ISettingsState) => {
        if (!settingsState.selected_environment) {
          return null;
        }
        return loginState[settingsState.selected_environment];
      }
    );
  }

  static GetCurrentLoginInfo() {
    return createSelector(
      [SettingsState.GetProperty('selected_environment'), LoginsState],
      (selectedEnvironment: string, loginsState: ILoginsState) => {
        return loginsState[selectedEnvironment];
      }
    );
  }

  static GetLoginLoadingState() {
    return createSelector(
      [SettingsState.GetProperty('selected_environment'), LoginsState],
      (selectedEnvironment: string, loginsState: ILoginsState) => {
        return loginsState?.[selectedEnvironment]?.loading || false;
      }
    );
  }
}
