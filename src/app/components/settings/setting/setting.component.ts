import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ISetting } from '../settings.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingComponent {
  @Input() setting: ISetting;
}
