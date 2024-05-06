import { Injectable } from '@angular/core';
import { Action, createSelector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { Servers } from 'src/app/config';
import { ApiService } from 'src/app/services/api.service';
import { TransformApiMethodGroups } from 'src/app/utilities';
import { MethodActions } from '../actions';
import { IApi, IApiState } from '../interfaces';
import { EditorService } from 'src/app/services/editor.service';

@State<IApiState>({
  name: 'apis',
  defaults: {}
})
@Injectable()
export class ApisState {
  constructor(private apiService: ApiService, private editorService: EditorService) {}

  @Action(MethodActions.GetMethods)
  getMethods({ patchState, getState }: StateContext<IApiState>, { server, force }: MethodActions.GetMethods) {
    const ctx = getState();
    if (ctx[server] && !force) {
      return null;
    }
    return this.apiService.retrieveMethods(server).pipe(
      tap((apis) => {
        const editorSchemas = this.editorService.buildJsonSchemas(apis.entities, server);
        const apiDef: IApi = {
          ...apis,
          lastUpdate: Math.trunc(Date.now() / 1000),
          apis: TransformApiMethodGroups(apis.apis, server),
          server,
          jsonSchemas: editorSchemas
        };
        patchState({ [server]: apiDef });
      })
    );
  }

  static GetApi(server: Servers) {
    return createSelector([ApisState], (apiState: IApiState) => apiState[server]);
  }
}
