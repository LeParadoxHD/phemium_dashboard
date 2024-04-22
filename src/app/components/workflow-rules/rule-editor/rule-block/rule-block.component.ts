import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-rule-block',
  templateUrl: './rule-block.component.html',
  styleUrl: './rule-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RuleBlockComponent {
  @Input() header: string;
}
