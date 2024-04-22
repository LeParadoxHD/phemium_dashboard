import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApisConfig, Servers } from '../config';
import { IApi, IEnvironment, IEnvironmentsState } from '../state/interfaces';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { EnvironmentsState, LoginsState, SettingsState } from '../state/store';
import { EMPTY, NEVER, Observable, catchError, filter, of, switchMap, take } from 'rxjs';
import { LoginActions } from '../state/actions';
import { HttpHeaderToRecord } from '../utilities';
import { CustomHttpResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private _http: HttpClient, private _store: Store, private _actions$: Actions) {}

  private getServer(server: Servers) {
    return ApisConfig.find((config) => config.id === server);
  }

  private getDomainUrl(server: Servers) {
    const config = this.getServer(server);
    if (!config) {
      throw new Error('Unable to retrieve current environment config');
    }
    return `${config.secure ? 'https' : 'http'}://${config.domain}`;
  }

  private getApiUrl(server: Servers) {
    const domainUrl = this.getDomainUrl(server);
    const config = this.getServer(server);
    return domainUrl + config.path;
  }

  retrieveMethods(server: Servers) {
    return this._http.get<IApi>(`${this.getDomainUrl(server)}/api.json`);
  }

  request(
    entity: string,
    method: string,
    parameters: any[] = [],
    server?: Servers,
    retry: number = 0
  ): Observable<CustomHttpResponse> {
    if (retry > 3) {
      alert('Unable to perform request');
      return NEVER;
    }
    let token: string = null;
    server ||= this._store.selectSnapshot(SettingsState.GetCurrentEnvironmentServer);
    token = this._store.selectSnapshot(LoginsState.GetCurrentToken())?.token;
    if (entity === 'login' && method.startsWith('login')) {
      token = null;
    }
    const formData = new FormData();
    formData.append('transaction_id', 'faye_' + new Date().getTime());
    if (token) formData.append('token', token);
    formData.append('entity', entity);
    formData.append('method', method);
    formData.append('format', 'json');
    const _parameters = this.constructParameters(parameters);
    formData.append('arguments', _parameters);
    const start = new Date().getTime();
    return this._http
      .post(this.getApiUrl(server), formData, {
        observe: 'response'
      })
      .pipe(
        catchError((error) => of(error)),
        switchMap((response) => {
          // Handle errors of session
          if (response.body && typeof response.body === 'object') {
            const json = response.body as any;
            if (json.error && json.message === 'No session found for token') {
              // Relogin if session is lost and retry request
              const currentEnvironment = this._store.selectSnapshot<string>(
                SettingsState.GetProperty('selected_environment')
              );
              this._store.dispatch(new LoginActions.LoginCustomer(currentEnvironment, true));
              return this._actions$.pipe(
                ofActionSuccessful(LoginActions.LoginCustomer),
                // Ensure token exists before proceeding to retry request
                switchMap(() => this._store.select(LoginsState.GetCurrentToken())),
                filter((login) => login.token !== null),
                take(1),
                switchMap(() => this.request(entity, method, parameters, server, retry + 1))
              );
            }
          }
          const end = new Date().getTime();
          return of({
            ...response,
            ok: response.ok && !(response.body as any)?.error,
            responseTime: end - start,
            headers: HttpHeaderToRecord(response.headers)
          } as CustomHttpResponse);
        })
      );
  }

  constructParameters(parameters: any[]) {
    const params = [];
    for (const [_, param] of parameters.entries()) {
      if (/\[\[.*?\]\]/.test(param)) {
        params.push(param);
      } else {
        params.push(JSON.stringify(param));
      }
    }
    return '[' + params.join(', ') + ']';
  }

  loginCustomer(environment: string) {
    const [envType, _] = environment.split('|');
    // Get config of environment
    const environmentsDict = this._store.selectSnapshot(EnvironmentsState) as IEnvironmentsState;
    if (Array.isArray(environmentsDict[envType]) && environmentsDict[envType].length > 0) {
      const env = environmentsDict[envType].find((e) => e.slug === environment) as IEnvironment;
      return this.request('login', 'login_customer', [env.login_user, env.login_password, env.token_expiration]);
    }
    return EMPTY;
  }
}
