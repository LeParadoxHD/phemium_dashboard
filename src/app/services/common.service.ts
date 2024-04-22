import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { ApisState, EnvironmentsState, LoginsState, SettingsState } from '../state/store';
import {
  Observable,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  map,
  shareReplay,
  switchMap
} from 'rxjs';
import { Servers } from '../config';
import { IApi, IEnvironmentsState } from '../state/interfaces';
import { IApiMethod, IApiMethodGroup } from '../interfaces';
import memo from 'memo-decorator';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  currentServer$: Observable<Servers>;
  currentEnvironment$: Observable<string>;
  currentToken$: Observable<string>;
  environments$: Observable<IEnvironmentsState>;
  environmentsCount$: Observable<number>;
  currentApi$: Observable<IApi>;
  currentApiItems$: Observable<IApiMethodGroup[]>;

  constructor(private store: Store) {
    // Current logged server: prerelease, live, aws, etc
    this.currentServer$ = this.store
      .select(SettingsState.GetCurrentEnvironmentServer)
      .pipe(
        filter(Boolean),
        distinctUntilChanged(),
        shareReplay({ bufferSize: 1, refCount: true })
      );

    // Current selected environment within server, example: prerelease|cofares-pro
    this.currentEnvironment$ = this.store
      .select(SettingsState.GetProperty('selected_environment'))
      .pipe(
        //
        filter(Boolean),
        distinctUntilChanged(),
        shareReplay({ bufferSize: 1, refCount: true })
      );

    this.currentToken$ = this.store.select(LoginsState.GetCurrentToken()).pipe(
      map((token) => token?.token),
      filter(Boolean),
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.environments$ = this.store.select<IEnvironmentsState>(EnvironmentsState).pipe(
      //
      filter(Boolean),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.environmentsCount$ = this.environments$.pipe(
      map((environments) => [...Object.values(environments)].length),
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    // Current API definition object, coming directly from $server/api.json
    this.currentApi$ = this.currentServer$.pipe(
      switchMap((server) => this.store.select(ApisState.GetApi(server))),
      filter(Boolean),
      distinctUntilKeyChanged('lastUpdate'),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    // Current API categories list
    this.currentApiItems$ = this.currentApi$.pipe(
      filter(Boolean),
      map((api) => api.apis),
      distinctUntilChanged((a, b) => a.length === b.length),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  @memo({
    resolver: (apiGroupList: IApiMethodGroup[], name: IApiMethodGroup['name']) =>
      apiGroupList?.[0].server + name
  })
  /**
   * Find a specific API group within the list of groups defined in the current API.
   *
   * @param apiGroupList The list of API groups.
   * @param name The name of the API group to find.
   * @returns The API group if found, `undefined` otherwise.
   */
  findApiGroup(apiGroupList: IApiMethodGroup[], name: IApiMethodGroup['name']): IApiMethodGroup {
    return apiGroupList.find((group) => group.name === name);
  }

  private _getApiGroupWithinSelectedApi_cache = new Map<
    IApiMethodGroup['name'],
    Observable<IApiMethodGroup>
  >();

  /**
   * Get the API group within the current API list.
   *
   * @param groupName The name of the API group to retrieve.
   * @returns The API group if found, `undefined` otherwise.
   * This method is memoized, so it will only retrieve the API group list once and then cache the result.
   */
  getApiGroupWithinSelectedApi(groupName: IApiMethodGroup['name']): Observable<IApiMethodGroup> {
    if (this._getApiGroupWithinSelectedApi_cache.has(groupName)) {
      // If the function params were previously requested, return the cached observable
      return this._getApiGroupWithinSelectedApi_cache.get(groupName);
    } else {
      // Create a new observable that will retrieve the API group list
      const apiGroupList$ = this.currentApiItems$.pipe(
        // Map the API group list to the found API group (or undefined if not found)
        map((apiGroupList) => this.findApiGroup(apiGroupList, groupName))
      );

      // Cache the observable and return it
      this._getApiGroupWithinSelectedApi_cache.set(
        groupName,
        apiGroupList$.pipe(
          // As this method is already memoized, we don't need to use distinctUntilChanged
          // to avoid retrieving the API group list every time the method is called.
          // Instead, we can just share the observable.
          shareReplay({ bufferSize: 1, refCount: true })
        )
      );
      return this._getApiGroupWithinSelectedApi_cache.get(groupName);
    }
  }

  @memo({
    resolver: (apiMethods: IApiMethod[], name: IApiMethod['name']) => apiMethods?.[0]?.server + name
  })
  /**
   * Find a specific API method within the list of methods defined in the current API category.
   *
   * @param apiGroupList The list of API groups.
   * @param name The name of the API group to find.
   * @returns The API group if found, `undefined` otherwise.
   */
  findApiMethod(apiMethods: IApiMethod[], name: IApiMethod['name']): IApiMethod {
    return apiMethods.find((method) => method.name === name);
  }

  private _getApiMethodWithinSelectedApiAndGroup_cache = new Map<string, Observable<IApiMethod>>();

  getApiMethodWithinSelectedApiAndGroup(
    groupName: IApiMethodGroup['name'],
    methodName: IApiMethod['name']
  ): Observable<IApiMethod> {
    const cacheKey = groupName + methodName;
    if (this._getApiMethodWithinSelectedApiAndGroup_cache.has(cacheKey)) {
      // If the function params were previously requested, return the cached observable
      return this._getApiMethodWithinSelectedApiAndGroup_cache.get(cacheKey);
    } else {
      // Create a new observable that will retrieve the API group list
      const apiMethod$ = this.getApiGroupWithinSelectedApi(groupName).pipe(
        map((apiGroup) => apiGroup.methods),
        map((apiMethods) => this.findApiMethod(apiMethods, methodName))
      );

      // Cache the observable and return it
      this._getApiMethodWithinSelectedApiAndGroup_cache.set(
        cacheKey,
        apiMethod$.pipe(
          // As this method is already memoized, we don't need to use distinctUntilChanged
          // to avoid retrieving the API group list every time the method is called.
          // Instead, we can just share the observable.
          shareReplay({ bufferSize: 1, refCount: true })
        )
      );
      return this._getApiMethodWithinSelectedApiAndGroup_cache.get(cacheKey);
    }
  }
}
