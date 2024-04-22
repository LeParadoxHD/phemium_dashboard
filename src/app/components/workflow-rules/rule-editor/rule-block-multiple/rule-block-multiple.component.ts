import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  Renderer2,
  TemplateRef
} from '@angular/core';

@Component({
  selector: 'app-rule-block-multiple',
  templateUrl: './rule-block-multiple.component.html',
  styleUrl: '../rule-block/rule-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RuleBlockMultipleComponent implements OnChanges {
  @Input() blocks: TemplateRef<any>[] = [];

  constructor(private ref: ElementRef, private renderer: Renderer2) {}

  ngOnChanges() {
    this.renderer.setStyle(this.ref.nativeElement, 'grid-template-columns', `repeat(${this.blocks.length}, 1fr)`);
  }
}
