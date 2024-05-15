import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SettingService } from './settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
  constructor(public settingsService: SettingService) {}
}
