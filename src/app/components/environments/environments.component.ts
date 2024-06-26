import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Actions, ofActionSuccessful, Select } from '@ngxs/store';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { Observable } from 'rxjs';
import { ApisConfig, Servers } from 'src/app/config';
import { AddEdit, IApiConfig } from 'src/app/interfaces';
import { LayoutService } from 'src/app/services/layout.service';
import { EnvironmentActions } from 'src/app/state/actions';
import { IEnvironment, IEnvironmentsWithLoginInfo } from 'src/app/state/interfaces';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { EnvironmentsWithToken } from 'src/app/utilities';
import { Clipboard } from '@angular/cdk/clipboard';
import { NzMessageService } from 'ng-zorro-antd/message';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-environments',
  templateUrl: './environments.component.html',
  styleUrls: ['./environments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnvironmentsComponent {
  @Select(EnvironmentsWithToken()) environments$: Observable<IEnvironmentsWithLoginInfo>;
  _envPanelId = -1;

  environmentTypes = ApisConfig;

  constructor(
    public layout: LayoutService,
    private _actions: Actions,
    private nzContextMenuService: NzContextMenuService,
    private clipboard: Clipboard,
    private message: NzMessageService
  ) {
    this._actions
      .pipe(
        ofActionSuccessful(EnvironmentActions.AddEnvironment, EnvironmentActions.EditEnvironment),
        takeUntilDestroyed()
      )
      .subscribe(() => this.edit.set(null));
  }

  edit = signal<{ mode: AddEdit; item?: Partial<IEnvironment> }>(null);

  add(apiConfig: IApiConfig) {
    this.edit.set({
      mode: 'add',
      item: { server: apiConfig.id, normalized: apiConfig.name }
    });
  }

  Edit(environment: IEnvironment, server: Servers) {
    this.edit.set({
      mode: 'edit',
      item: {
        ...environment,
        server: server
      }
    });
  }

  contextMenu($event: MouseEvent, menu: NzDropdownMenuComponent): void {
    this.nzContextMenuService.create($event, menu);
  }

  closeMenu(): void {
    this.nzContextMenuService.close();
  }

  copyToClipboard(text: string) {
    this.clipboard.copy(text);
    this.message.success('Token copied to clipboard!', {
      nzDuration: 2000
    });
  }

  onPanelResize({ width }: NzResizeEvent) {
    cancelAnimationFrame(this._envPanelId);
    this._envPanelId = requestAnimationFrame(() => {
      this.layout.environmentsPanelWidth$.next(width!);
    });
  }
}
