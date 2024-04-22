import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { LayoutService } from './services/layout.service';
import { LogsState } from './state/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  menuPanelId = -1;
  debugPanelId = -1;

  @Select(LogsState.GetLogPanelMinHeight) logPanelMinHeight$: Observable<number>;

  @HostListener('document:keydown.l')
  showState() {
    console.log(this._store.snapshot());
  }

  constructor(private _store: Store, public layout: LayoutService) {}

  onMenuResize({ width }: NzResizeEvent, end: boolean): void {
    cancelAnimationFrame(this.menuPanelId);
    this.menuPanelId = requestAnimationFrame(() => {
      if (end) this.layout.menuPanelWidth$.next(width!);
      document.documentElement.style.setProperty('--menu-panel-width', `${width}px`);
    });
  }

  onDebugPanelResize({ height }: NzResizeEvent, end: boolean): void {
    cancelAnimationFrame(this.debugPanelId);
    this.debugPanelId = requestAnimationFrame(() => {
      if (end) this.layout.debugPanelHeight$.next(height!);
      document.documentElement.style.setProperty('--debug-panel-height', `${height}px`);
    });
  }
}
