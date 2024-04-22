import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ILog } from 'src/app/state/interfaces';
import { LogsState } from 'src/app/state/store';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogsComponent {
  @Select(LogsState.GetLogs) logs$: Observable<ILog[]>;
}
