import { FormGroup } from '@angular/forms';
import { IParam } from '../edit-parameters/edit-parameters.component';
import { Typed } from 'src/app/state/interfaces';

export function updateControlState(control: FormGroup<Typed<IParam>>, value: any) {
  if (value === null) {
    control.get('null').setValue(true, { emitEvent: false });
    control.get('undefined').disable({ emitEvent: false });
    control.get('type').disable({ emitEvent: false });
    control.get('value').disable({ emitEvent: false });
    control.get('null').enable({ emitEvent: false });
  } else if (value === undefined) {
    control.get('undefined').setValue(true, { emitEvent: false });
    control.get('undefined').enable({ emitEvent: false });
    control.get('type').disable({ emitEvent: false });
    control.get('value').disable({ emitEvent: false });
    control.get('null').disable({ emitEvent: false });
  } else {
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    control.get('value').setValue(value, { emitEvent: false });
    control.get('undefined').enable({ emitEvent: false });
    control.get('value').enable({ emitEvent: false });
    control.get('null').enable({ emitEvent: false });
    control.get('type').enable({ emitEvent: false });
  }
}
