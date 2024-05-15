import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  NgZone,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { MonacoEditorOptions } from 'src/app/services/editor.service';
import { JsonValidator } from '../workflow-rules/rule-editor/utils/validators';
import { stripUnderscores } from 'src/app/utilities';
import { TitleCasePipe } from '@angular/common';

export interface JsonEditorPayload {
  code: string;
  model?: string;
  title?: string;
}

@Component({
  selector: 'app-json-editor',
  templateUrl: './json-editor.component.html',
  styleUrl: './json-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TitleCasePipe]
})
export class JsonEditorComponent implements OnInit {
  options: MonacoEditorOptions = {
    readOnly: false,
    lineNumbers: 'on'
  };

  model = null;

  modelPretty = '';

  constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone, private titleCase: TitleCasePipe) {
    if (this.nzModalData.model) {
      this.model = this.nzModalData.model;
      this.modelPretty = this.titleCase.transform(stripUnderscores(this.nzModalData.model));
    }
  }

  intelliSense = signal(false);
  enableIntelliSense() {
    this.ngZone.run(() => this.intelliSense.set(true));
  }

  readonly modal = inject(NzModalRef);
  readonly nzModalData = inject<JsonEditorPayload>(NZ_MODAL_DATA);

  code = new FormControl('', Validators.compose([Validators.required, JsonValidator]));

  updateValidity() {
    this.code.updateValueAndValidity();
  }

  updateValue(newCode: string) {
    this.code.setValue(newCode);
  }

  ngOnInit() {
    const text = this.nzModalData.code || '';
    this.code.setValue(text);
    this.code.updateValueAndValidity();
    this.cdr.markForCheck();
  }

  handleCancel() {
    this.modal.destroy(undefined);
  }

  destroyModal(): void {
    this.modal.destroy(this.code.value);
  }
}
