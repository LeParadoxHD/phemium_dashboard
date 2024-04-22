import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Observable, map, startWith } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { SettingsActions } from 'src/app/state/actions';
import { ConfigState, SettingsState } from 'src/app/state/store';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerComponent implements OnInit {
  version: string;
  darkTheme: FormControl;

  environmentsLength$: Observable<number>;
  isSelectedEnvironment$: Observable<boolean>;

  constructor(private _store: Store, private commonService: CommonService) {
    this.version = this._store.selectSnapshot(ConfigState.GetProperty('version'));
    const darkTheme = this._store.selectSnapshot<boolean>(SettingsState.GetProperty('dark_theme'));
    this.darkTheme = new FormControl(!darkTheme);
    this.environmentsLength$ = this.commonService.environmentsCount$;
    this.isSelectedEnvironment$ = this.commonService.currentEnvironment$.pipe(map(() => true));
  }

  ngOnInit() {
    this.darkTheme.valueChanges.pipe(startWith(this.darkTheme.value)).subscribe((light) => {
      const isDark = !light;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      this._store.dispatch(new SettingsActions.SetProperty('dark_theme', isDark));
    });
  }
}
