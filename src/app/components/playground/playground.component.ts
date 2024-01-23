import { ChangeDetectionStrategy, ChangeDetectorRef, Component, TrackByFunction } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { Observable } from 'rxjs';
import { IView } from 'src/app/interfaces';
import { LayoutService } from 'src/app/services/layout.service';
import { ViewActions } from 'src/app/state/actions';
import { ViewState } from 'src/app/state/store';

@Component({
  selector: 'app-playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaygroundComponent {
  mode: 'top' | 'left' = 'top';

  xhrPanelId = -1;
  requestPanelId = -1;
  xhrHeight = 400;

  public readonly trackById: TrackByFunction<IView> = (idx, { api }) => api.id;

  @Select(ViewState.GetTabs) tabs$: Observable<IView[]>;
  @Select(ViewState.GetCurrentTabIndex) tabIndex$: Observable<number>;

  constructor(private _cdr: ChangeDetectorRef, public layout: LayoutService, private _store: Store) {}

  onResizeXhr({ height }: NzResizeEvent): void {
    console.log(height);
    cancelAnimationFrame(this.xhrPanelId);
    this.xhrPanelId = requestAnimationFrame(() => {
      this.xhrHeight = height!;
      this._cdr.markForCheck();
    });
  }

  onRequestPanelResize({ width }: NzResizeEvent, end: boolean): void {
    console.log(width, end);
    cancelAnimationFrame(this.requestPanelId);
    this.requestPanelId = requestAnimationFrame(() => {
      if (end) this.layout.debugPanelHeight$.next(width!);
      document.documentElement.style.setProperty('--request-panel-width', `${width}px`);
    });
  }

  closeTab({ index }: { index: number }) {
    this._store.dispatch(new ViewActions.RemoveView(index));
  }

  onTabIndexChange(index: number) {
    this._store.dispatch(new ViewActions.SetTabIndex(index));
  }
}
