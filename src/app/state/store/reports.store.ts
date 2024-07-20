import { Injectable } from '@angular/core';
import { Action, State, StateContext, Store, createSelector } from '@ngxs/store';
import { ApiService, body } from 'src/app/services/api.service';
import { IDocument, IReportsState, IReportsStateData, PaginatedResponse } from '../interfaces';
import { ReportsActions } from '../actions';
import { patch } from 'src/app/utilities';
import { tap } from 'rxjs';
import { SettingsState } from './settings.store';
import { IMPORT_SUFFIX, PREVIEW_SUFFIX, TOOL_SUFFIX } from 'src/app/components/reports/reports.service';

@State<IReportsState>({
  name: 'reports',
  defaults: {}
})
@Injectable()
export class ReportsState {
  constructor(private apiService: ApiService, private store: Store) {}

  @Action(ReportsActions.GetReports)
  getReports({ getState, setState }: StateContext<IReportsState>, { environment, force }: ReportsActions.GetReports) {
    const ctx = getState();
    if (ctx[environment] && !force) {
      return null;
    }
    setState(
      patch<IReportsState>({
        [environment]: patch<IReportsStateData>({
          loading: true
        })
      })
    );
    return this.apiService
      .request<PaginatedResponse<IDocument>>({
        entity: 'documents',
        method: 'get_documents',
        parameters: [1]
      })
      .pipe(
        body(),
        tap(({ items }) =>
          setState(
            patch<IReportsState>({
              [environment]: patch<IReportsStateData>({
                loading: false,
                documents: items
              })
            })
          )
        )
      );
  }

  @Action(ReportsActions.GetReports)
  setSelectedDocument({ setState }: StateContext<IReportsState>, { documentId }: ReportsActions.SetSelectedDocument) {
    const environment = this.store.selectSnapshot(SettingsState.GetProperty('selected_environment'));
    setState(
      patch<IReportsState>({
        [environment]: patch<IReportsStateData>({
          selected_document: documentId
        })
      })
    );
  }

  static GetSelectedDocument(environment: string) {
    return createSelector([ReportsState], (state: IReportsState) => {
      if (Array.isArray(state[environment]?.documents) && state[environment].selected_document) {
        return state[environment].documents.find((doc) => doc.id === state[environment].selected_document);
      }
      return null;
    });
  }

  static GetDocuments(environment: string) {
    return createSelector([ReportsState], (state: IReportsState) => {
      if (Array.isArray(state[environment]?.documents)) {
        return state[environment].documents.filter(
          (doc) =>
            !doc?.external_id?.endsWith(PREVIEW_SUFFIX) &&
            !doc?.external_id?.endsWith(TOOL_SUFFIX) &&
            !doc?.external_id?.endsWith(IMPORT_SUFFIX)
        );
      }
      return [];
    });
  }
}
