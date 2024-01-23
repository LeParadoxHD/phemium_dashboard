import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Actions, ofActionSuccessful, Select } from '@ngxs/store';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApisConfig, Environments } from 'src/app/config';
import { AddEdit, IApiConfig } from 'src/app/interfaces';
import { LayoutService } from 'src/app/services/layout.service';
import { EnvironmentActions } from 'src/app/state/actions';
import { IEnvironment, IEnvironmentsState } from 'src/app/state/interfaces';
import { EnvironmentsState } from 'src/app/state/store';

@Component({
  selector: 'app-environments',
  templateUrl: './environments.component.html',
  styleUrls: ['./environments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnvironmentsComponent implements OnInit {
  @Select(EnvironmentsState) environments$: Observable<IEnvironmentsState>;
  _envPanelId = -1;

  environmentTypes = ApisConfig;

  constructor(public layout: LayoutService, private _actions: Actions) {}

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

  onPanelResize({ width }: NzResizeEvent) {
    cancelAnimationFrame(this._envPanelId);
    this._envPanelId = requestAnimationFrame(() => {
      this.layout.environmentsPanelWidth$.next(width!);
    });
  }
}
