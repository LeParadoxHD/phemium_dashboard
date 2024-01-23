import { Injectable } from '@angular/core';
import {
  Action,
  createSelector,
  Selector,
  State,
  StateContext
} from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { Environments } from 'src/app/config';
import { ApiService } from 'src/app/services/api.service';
import { TransformApiMethodGroups } from 'src/app/utilities';
import { MethodActions } from '../actions';
import { IApiState } from '../interfaces';

@State<IApiState>({
  name: 'apis',
  defaults: {}
})
@Injectable()
export class ApisState {
  constructor(private apiService: ApiService) {}

  @Action(MethodActions.GetMethods)
  getMethods(
    { patchState, getState }: StateContext<IApiState>,
    { environment, force }: MethodActions.GetMethods
  ) {
    const ctx = getState();
    if (ctx[environment] && !force) {
      return null;
    }
    return this.apiService.retrieveMethods(environment).pipe(
      tap((apis) => {
        apis.apis = TransformApiMethodGroups(apis.apis);
        patchState({ [environment]: apis });
      })
    );
  }

  static GetApi(env: Environments) {
    return createSelector([ApisState], (apiState) => apiState[env]);
  }
}
