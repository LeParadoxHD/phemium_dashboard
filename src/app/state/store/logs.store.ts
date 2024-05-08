import { Injectable } from '@angular/core';
import { Action, NgxsOnChanges, NgxsOnInit, NgxsSimpleChange, Selector, State, StateContext } from '@ngxs/store';
import { insertItem, patch } from '@ngxs/store/operators';
import { LogActions } from '../actions';
import { ILogsState } from '../interfaces';

@State<ILogsState>({
  name: 'logs',
  defaults: {
    logs: [],
    limit: 20
  }
})
@Injectable()
export class LogsState implements NgxsOnChanges, NgxsOnInit {
  computePanelHeight(numberOfLines: number) {
    const rowHeight = getComputedStyle(document.documentElement).getPropertyValue('--log-row-height');
    if (rowHeight && numberOfLines <= 3) {
      const newHeight = numberOfLines * +rowHeight.replace('px', '');
      document.documentElement.style.setProperty('--debug-panel-height', `${newHeight}px`);
    }
  }

  ngxsOnInit({ getState }: StateContext<ILogsState>) {
    const ctx = getState();
    if (ctx.logs.length > 0) {
      this.computePanelHeight(ctx.logs.length);
    }
  }
  ngxsOnChanges(change: NgxsSimpleChange<ILogsState>) {
    this.computePanelHeight(change.currentValue.logs.length);
  }

  @Action(LogActions.Add)
  add({ setState }: StateContext<ILogsState>, { log }: LogActions.Add) {
    setState(
      patch({
        logs: insertItem(log)
      })
    );
  }

  @Action(LogActions.ChangeLimit)
  changeLimit({ setState }: StateContext<ILogsState>, { limit }: LogActions.ChangeLimit) {
    setState(patch({ limit }));
  }

  @Action(LogActions.ChangeFilter)
  changeFilter({ setState }: StateContext<ILogsState>, { filter }: LogActions.ChangeFilter) {
    setState(patch({ filter }));
  }

  @Selector()
  static GetLogs(state: ILogsState) {
    return [...state.logs].reverse();
  }

  @Selector()
  static GetLogPanelMinHeight(state: ILogsState) {
    const rowHeight = 25;
    if (state.logs.length <= 3) {
      return rowHeight * state.logs.length;
    }
    return rowHeight * 3;
  }
}
