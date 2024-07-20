import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApisConfig, Servers } from '../config';
import { IApi, IEnvironment, IEnvironmentsState } from '../state/interfaces';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { EnvironmentsState, LoginsState, SettingsState } from '../state/store';
import { EMPTY, NEVER, Observable, catchError, filter, lastValueFrom, map, of, pipe, switchMap, take } from 'rxjs';
import { LoginActions } from '../state/actions';
import { HttpHeaderToRecord, INTERNAL_REQUEST } from '../utilities';
import { CustomHttpResponse } from '../interfaces';

export interface RequestOptions {
  entity: string;
  method: string;
  parameters?: any[];
  internal?: boolean;
  server?: Servers;
  retry?: number;
}

/**
 * Extracts the body of a CustomHttpResponse
 * @param T Type of the body
 * @returns
 */
export function body<T>() {
  return pipe(
    map((response: CustomHttpResponse<T>) => {
      if ('body' in response) {
        return response.body;
      }
      return null;
    })
  );
}

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
    return this._http.get<IApi>(`${this.getDomainUrl(server)}/api.json`, {
      context: new HttpContext().set(INTERNAL_REQUEST, true)
    });
  }

  requestPromise<T = any>(options: RequestOptions): Promise<CustomHttpResponse<T>> {
    return lastValueFrom(this.request<T>(options));
  }

  request<T = any>(options: RequestOptions): Observable<CustomHttpResponse<T>> {
    options.parameters ||= [];
    options.internal ||= false;
    options.retry ||= 0;
    if (options.retry > 3) {
      alert('Unable to perform request');
      return NEVER;
    }
    let token: string = null;
    options.server ||= this._store.selectSnapshot(SettingsState.GetCurrentEnvironmentServer);
    token = this._store.selectSnapshot(LoginsState.GetCurrentToken())?.token;
    if (options.entity === 'login' && options.method.startsWith('login')) {
      token = null;
    }
    const formData = new FormData();
    formData.append('transaction_id', 'faye_' + new Date().getTime());
    if (token) formData.append('token', token);
    formData.append('entity', options.entity);
    formData.append('method', options.method);
    formData.append('format', 'json');
    const _parameters = this.constructParameters(options.parameters);
    formData.append('arguments', _parameters);
    const start = new Date().getTime();
    const context = options.internal ? new HttpContext().set(INTERNAL_REQUEST, true) : new HttpContext();
    return this._http
      .post(this.getApiUrl(options.server), formData, {
        observe: 'response',
        context
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
                switchMap(() =>
                  this.request({
                    ...options,
                    retry: options.retry + 1
                  })
                )
              );
            }
          }
          const end = new Date().getTime();
          return of({
            ...response,
            ok: response.ok && !(response.body as any)?.error,
            responseTime: end - start,
            headers: HttpHeaderToRecord(response.headers)
          } as CustomHttpResponse<T>);
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
      return this.request({
        entity: 'login',
        method: 'login_customer',
        parameters: [env.login_user, env.login_password, env.token_expiration],
        internal: true
      });
    }
    return EMPTY;
  }

  async getPdf(url: string) {
    return lastValueFrom(
      this._http.get(url, { responseType: 'blob', context: new HttpContext().set(INTERNAL_REQUEST, true) }).pipe(
        map((blob) => {
          if (blob instanceof Blob) {
            return window.URL.createObjectURL(blob);
          }
          return null;
        })
      )
    );
  }
}
