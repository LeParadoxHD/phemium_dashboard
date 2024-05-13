import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { Observable } from 'rxjs';
import { IView } from 'src/app/interfaces';
import { CommonService } from 'src/app/services/common.service';
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

  currentEnvironment$: Observable<string>;

  @Select(ViewState.GetTabs) tabs$: Observable<IView[]>;
  @Select(ViewState.GetCurrentTabIndex) tabIndex$: Observable<number>;

  constructor(
    private _cdr: ChangeDetectorRef,
    public layout: LayoutService,
    private _store: Store,
    private nzContextMenuService: NzContextMenuService,
    private commonService: CommonService
  ) {
    this.currentEnvironment$ = this.commonService.currentEnvironment$;
  }

  contextMenu($event: MouseEvent, menu: NzDropdownMenuComponent): void {
    this.nzContextMenuService.create($event, menu);
  }

  onResizeXhr({ height }: NzResizeEvent): void {
    cancelAnimationFrame(this.xhrPanelId);
    this.xhrPanelId = requestAnimationFrame(() => {
      this.xhrHeight = height!;
      this._cdr.markForCheck();
      window.dispatchEvent(new Event('resize'));
    });
  }

  onRequestPanelResize({ width }: NzResizeEvent, end: boolean): void {
    cancelAnimationFrame(this.requestPanelId);
    this.requestPanelId = requestAnimationFrame(() => {
      if (end) this.layout.requestPanelWidth$.next(width!);
      document.documentElement.style.setProperty('--request-panel-width', `${width}px`);
      window.dispatchEvent(new Event('resize'));
    });
  }

  closeTab({ index }: { index: number }) {
    this._store.dispatch(new ViewActions.RemoveView(index));
  }

  closeTabExceptThisOne({ index }: { index: number }) {
    this._store.dispatch(new ViewActions.RemoveViewExceptThisOne(index));
  }

  onTabIndexChange(index: number) {
    this._store.dispatch(new ViewActions.SetTabIndex(index));
  }
}
