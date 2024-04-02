import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Actions, ofActionSuccessful, Select } from '@ngxs/store';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApisConfig, Environments } from 'src/app/config';
import { AddEdit, IApiConfig } from 'src/app/interfaces';
import { LayoutService } from 'src/app/services/layout.service';
import { EnvironmentActions } from 'src/app/state/actions';
import { IEnvironment, IEnvironmentsWithLoginInfo } from 'src/app/state/interfaces';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { EnvironmentsWithToken } from 'src/app/utilities';
import { Clipboard } from '@angular/cdk/clipboard';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-environments',
  templateUrl: './environments.component.html',
  styleUrls: ['./environments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnvironmentsComponent implements OnInit {
  @Select(EnvironmentsWithToken()) environments$: Observable<IEnvironmentsWithLoginInfo>;
  _envPanelId = -1;

  environmentTypes = ApisConfig;

  constructor(
    public layout: LayoutService,
    private _actions: Actions,
    private nzContextMenuService: NzContextMenuService,
    private clipboard: Clipboard,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this._actions
      .pipe(ofActionSuccessful(EnvironmentActions.AddEnvironment, EnvironmentActions.EditEnvironment))
      .subscribe(() => this.edit$.next(null));
  }

  edit$ = new BehaviorSubject<{ mode: AddEdit; item?: Partial<IEnvironment> }>(null);

  add(apiConfig: IApiConfig) {
    this.edit$.next({
      mode: 'add',
      item: { env: apiConfig.id, normalized: apiConfig.name }
    });
  }

  edit(environment: IEnvironment, envType: Environments) {
    this.edit$.next({
      mode: 'edit',
      item: {
        ...environment,
        env: envType
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
