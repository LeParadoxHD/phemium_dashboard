import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApisConfig, Environments } from '../config';
import { IApi, IEnvironment, IEnvironmentsState } from '../state/interfaces';
import memo from 'memo-decorator';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { EnvironmentsState, LoginsState, SettingsState } from '../state/store';
import { EMPTY, NEVER, Observable, catchError, of, switchMap } from 'rxjs';
import { LoginActions } from '../state/actions';
import { HttpHeaderToRecord } from '../utilities';
import { CustomHttpResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private _http: HttpClient, private _store: Store, private _actions$: Actions) {}

  @memo()
  private getEnvironment(environment: Environments) {
    return ApisConfig.find((config) => config.id === environment);
  }

  @memo()
  private getDomainUrl(environment: Environments) {
    const config = this.getEnvironment(environment);
    if (!config) {
      throw new Error('Unable to retrieve current environment config');
    }
    return `${config.secure ? 'https' : 'http'}://${config.domain}`;
  }

  @memo()
  private getApiUrl(environment: Environments) {
    const domainUrl = this.getDomainUrl(environment);
    const config = this.getEnvironment(environment);
    return domainUrl + config.path;
  }

  retrieveMethods(environment: Environments) {
    return this._http.get<IApi>(`${this.getDomainUrl(environment)}/api.json`);
  }

  request(
    entity: string,
    method: string,
    parameters: any[] = [],
    environmentType?: Environments,
    retry: number = 0
  ): Observable<CustomHttpResponse> {
    if (retry > 3) {
      alert('Unable to perform request');
      return NEVER;
    }
    let token: string = null;
    environmentType ||= this._store.selectSnapshot(SettingsState.GetCurrentEnvironmentType);
    console.log('EnvironmentType:', environmentType);
    token = this._store.selectSnapshot(LoginsState.GetCurrentToken()).token;
    if (entity === 'login' && method.startsWith('login')) {
      token = null;
    }
    console.log('Token:', token);
    const formData = new FormData();
    formData.append('transaction_id', 'faye_' + new Date().getTime());
    if (token) formData.append('token', token);
    formData.append('entity', entity);
    formData.append('method', method);
    formData.append('format', 'json');
    const _parameters = this.constructParameters(parameters);
    console.log({ _parameters });
    formData.append('arguments', _parameters);
    const start = new Date().getTime();
    return this._http
      .post(this.getApiUrl(environmentType), formData, {
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
              console.log('CurrentEnvironment:', currentEnvironment);
              this._store.dispatch(new LoginActions.LoginCustomer(currentEnvironment, true));
              return this._actions$.pipe(
                ofActionSuccessful(LoginActions.LoginCustomer),
                switchMap(() => this.request(entity, method, parameters, environmentType, retry + 1))
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
