import { ChangeDetectionStrategy, Component, OnInit, Signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { NzSelectComponent } from 'ng-zorro-antd/select';
import { Observable } from 'rxjs';
import { ApisConfig } from 'src/app/config';
import { IApiMethod, IApiMethodGroup } from 'src/app/interfaces';
import { CommonService } from 'src/app/services/common.service';
import { MethodActions, SettingsActions, ViewActions } from 'src/app/state/actions';
import { IEnvironmentsState } from 'src/app/state/interfaces';
import { LoginsState, SettingsState } from 'src/app/state/store';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements OnInit {
  selectedEnvironment$: Observable<string>;
  selectedServer$: Observable<string>;
  methods$: Observable<IApiMethodGroup[]>;

  openMap: { [name: string]: boolean } = {};
  envControl = new FormControl(null);
  environment;
  availableApis = ApisConfig;

  environments: Signal<IEnvironmentsState>;
  @Select(LoginsState.GetLoginLoadingState()) loginLoading$: Observable<boolean>;

  @ViewChild('envSelector') envSelector: NzSelectComponent;

  constructor(private _store: Store, private commonService: CommonService) {
    this.selectedEnvironment$ = this.commonService.currentEnvironment$;
    this.selectedServer$ = this.commonService.currentServerName$;
    this.methods$ = this.commonService.currentApiItems$;
    this.environments = toSignal(this.commonService.environments$);
  }

  selectedEnvironment(envSlug: string) {
    this._store.dispatch(new SettingsActions.SetProperty('selected_environment', envSlug));
  }

  closeSelector() {
    this.envSelector.setOpenState(false);
  }

  openHandler(value: string): void {
    for (const key in this.openMap) {
      if (key !== value) {
        this.openMap[key] = false;
      }
    }
  }

  ngOnInit() {
    this._store.dispatch(new MethodActions.GetMethods('prerelease'));
    const currentEnvironment = this._store.selectSnapshot(SettingsState.GetProperty('selected_environment'));
    if (currentEnvironment) {
      this.envControl.setValue(currentEnvironment);
    }
  }

  addMethodToView(method: IApiMethod) {
    this._store.dispatch(new ViewActions.AddView(method));
  }
}
