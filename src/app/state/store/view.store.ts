import { Injectable } from '@angular/core';
import { Action, createSelector, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { ViewActions } from '../actions';
import { IViewState } from '../interfaces';
import { append, removeItem, updateItem } from '@ngxs/store/operators';
import { IView, IViewRequest, IViewResponse, IViewResult } from 'src/app/interfaces';
import { ApiService } from 'src/app/services/api.service';
import { tap } from 'rxjs';
import { patch } from 'src/app/utilities';

@State<IViewState>({
  name: 'view',
  defaults: {
    tabs: [],
    selectedTabIndex: 0
  }
})
@Injectable()
export class ViewState implements NgxsOnInit {
  constructor(private _api: ApiService) {}

  ngxsOnInit({ getState, setState }: StateContext<IViewState>): void {
    let ctx = Object.assign({}, getState());
    if (ctx.tabs?.length > 0) {
      ctx.tabs = ctx.tabs.map((tab) => ({ ...tab, loading: false }));
    }
    setState(ctx);
  }

  @Action(ViewActions.AddView)
  addTab({ setState, getState }: StateContext<IViewState>, { method }: ViewActions.AddView) {
    const tabs = getState().tabs;
    const tabIndex = tabs.findIndex((tab) => tab.api.id === method.id);
    if (tabIndex > -1) {
      // Method already exist in view, skipping...
      return setState(
        patch<IViewState>({
          selectedTabIndex: tabIndex
        })
      );
    }
    return setState(
      patch<IViewState>({
        tabs: append<IView>([{ api: method, parameters: [] }]),
        selectedTabIndex: tabs.length
      })
    );
  }

  @Action(ViewActions.RemoveView)
  removeTab({ setState }: StateContext<IViewState>, { index }: ViewActions.RemoveView) {
    switch (typeof index) {
      case 'number':
        setState(
          patch<IViewState>({
            tabs: removeItem<IView>(index)
          })
        );
        return;
      case 'string':
        setState(
          patch<IViewState>({
            tabs: removeItem<IView>((tab) => tab.api.id === index)
          })
        );
        return;
      default:
    }
  }

  @Action(ViewActions.RemoveViewExceptThisOne)
  removeTabExceptThisOne(
    { setState, getState }: StateContext<IViewState>,
    { index }: ViewActions.RemoveViewExceptThisOne
  ) {
    const tab = getState().tabs?.[index];
    if (tab) {
      switch (typeof index) {
        case 'number':
          setState(
            patch<IViewState>({
              tabs: [tab]
            })
          );
          return;
        default:
      }
    }
  }

  @Action(ViewActions.UpdateViewParameters)
  updateViewParameters(
    { setState }: StateContext<IViewState>,
    { method, parameters }: ViewActions.UpdateViewParameters
  ) {
    setState(
      patch<IViewState>({
        tabs: updateItem<IView>((item) => item.api.id === method, patch({ parameters }))
      })
    );
  }

  @Action(ViewActions.UpdateViewVirtualParameters)
  updateViewVirtualParameters(
    { setState }: StateContext<IViewState>,
    { method, parameters }: ViewActions.UpdateViewVirtualParameters
  ) {
    setState(
      patch<IViewState>({
        tabs: updateItem<IView>((item) => item.api.id === method, patch({ virtualParameters: parameters }))
      })
    );
  }

  @Action(ViewActions.SetTabIndex)
  setTabIndex({ setState }: StateContext<IViewState>, { index }: ViewActions.SetTabIndex) {
    setState(
      patch<IViewState>({
        selectedTabIndex: index
      })
    );
  }

  @Action(ViewActions.PerformRequest)
  performRequest(
    { setState, getState }: StateContext<IViewState>,
    { entity, method, parameters }: ViewActions.PerformRequest
  ) {
    const tabId = `${entity}-${method}`;
    const myTabIndex = getState().tabs.findIndex((tab) => tab.api.id === tabId);
    setState(
      patch<IViewState>({
        tabs: updateItem<IView>(
          myTabIndex,
          patch<IView>({
            loading: true,
            result: patch<IViewResult>({
              date: Date.now(),
              request: patch<IViewRequest>({
                // headers: HttpHeaderToRecord(response.headers)
                parameters
              })
            })
          })
        )
      })
    );
    return this._api
      .request<IViewResponse>({
        entity,
        method,
        parameters
      })
      .pipe(
        tap((response) => {
          setState(
            patch<IViewState>({
              tabs: updateItem<IView>(
                myTabIndex,
                patch<IView>({
                  loading: false,
                  result: patch<IViewResult>({
                    response
                  })
                })
              )
            })
          );
        })
      );
  }

  @Selector()
  static GetTabs(ctx: IViewState) {
    return ctx.tabs;
  }

  static GetTabVirtualParameters(tabId: string) {
    return createSelector(
      [ViewState],
      (viewsState: IViewState) => viewsState.tabs.find((tab) => tab.api.id === tabId)?.virtualParameters
    );
  }

  static GetTabLoadingStatus(tabId: string) {
    return createSelector(
      [ViewState],
      (viewsState: IViewState) => viewsState.tabs.find((tab) => tab.api.id === tabId)?.loading || false
    );
  }

  @Selector()
  static GetCurrentTabIndex(ctx: IViewState) {
    return ctx.selectedTabIndex;
  }

  static GetTabParametersValue(methodId: string) {
    return createSelector(
      [ViewState],
      (viewState: IViewState) => viewState?.tabs?.find((tab) => tab?.api?.id === methodId)?.parameters
    );
  }
}
