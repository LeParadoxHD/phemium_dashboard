import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Typed } from 'src/app/state/interfaces';
import { IParam } from '../edit-parameters/edit-parameters.component';

export function isNumeric(value: any) {
  return !isNaN(value);
}

interface ValidateNumberOptions {
  acceptsComputedValue?: boolean;
  acceptEmpty?: boolean;
}
export function ValidateNumber(value: any, options?: ValidateNumberOptions): ValidationErrors | null {
  options ||= {};
  options.acceptsComputedValue ||= false;
  options.acceptEmpty ||= false;
  if (options.acceptEmpty && !value.toString()) {
    return null;
  }
  switch (typeof value) {
    case 'number':
      return null;
    case 'string':
      if (isNumeric(value)) {
        // Value is a number or string but is a valid number
        return null;
      } else {
        if (options.acceptsComputedValue && value.startsWith('{') && value.endsWith('}')) {
          // Check if computed value is empty
          if (value === '{}') {
            return { invalidComputedValue: true };
          } else {
            return null; // Valid computed value
          }
        } else {
          return { notNumber: true }; // Invalid number
        }
      }
    default:
      return { invalid: true };
  }
}

interface ValidateStringOptions {
  acceptsComputedValue?: boolean;
  acceptEmpty?: boolean;
}
export function ValidateString(value: any, options?: ValidateStringOptions): ValidationErrors | null {
  options ||= {};
  options.acceptsComputedValue ||= false;
  options.acceptEmpty ||= false;
  switch (typeof value) {
    case 'string':
      if (value) {
        if (options.acceptsComputedValue && IsComputedValue(value)) {
          return ValidateComputedValue(value);
        }
        return null;
      } else {
        if (options.acceptEmpty) {
          return null;
        } else {
          return { empty: true };
        }
      }
    default:
      return { invalid: true };
  }
}

export function IsComputedValue(value: string): boolean {
  return value.startsWith('{') && value.endsWith('}');
}

export function ValidateComputedValue(value: string): ValidationErrors | null {
  // Check if computed value is empty
  if (value === '{}') {
    return { invalidComputedValue: true };
  } else {
    return null; // Valid computed value
  }
}

interface ValidateBooleanOptions {
  acceptsComputedValue?: boolean;
}
export function ValidateBoolean(value: any, options?: ValidateBooleanOptions): ValidationErrors | null {
  options ||= {};
  switch (typeof value) {
    case 'boolean':
      return null;
    case 'string':
      if (value === 'true' || value === 'false') {
        return null;
      } else if (options.acceptsComputedValue && IsComputedValue(value)) {
        return ValidateComputedValue(value);
      } else {
        return { notBoolean: true };
      }
    default:
      return { invalid: true };
  }
}

export function ValidateJSON(value: any): ValidationErrors | null {
  switch (typeof value) {
    case 'object':
      return null;
    case 'string':
      try {
        JSON.parse(value);
        return null;
      } catch (err) {
        return { invalid: true };
      }
    default:
      return { invalid: true };
  }
}

export function ParameterValidator(): ValidatorFn {
  return (group: FormGroup<Typed<IParam>>): ValidationErrors | null => {
    const type = group.get('type').value;
    const isNull = group.get('null').value;
    const isUndefined = group.get('undefined').value;
    const value = group.get('value').value;
    if (isNull || isUndefined) {
      return null;
    }
    if (type !== 'bool' && !value) {
      return { invalid: true };
    }
    switch (type) {
      case 'integer':
      case 'int':
      case 'number':
        return ValidateNumber(value, {
          acceptsComputedValue: true
        });
      case 'string':
        return ValidateString(value, {
          acceptsComputedValue: true
        });
      case 'boolean':
      case 'bool':
        return ValidateBoolean(value, {
          acceptsComputedValue: true
        });
      default:
        return ValidateJSON(value);
    }
  };
}

export function JsonValidator(control: AbstractControl): ValidationErrors | null {
  if (control.value) {
    switch (typeof control.value) {
      case 'string':
        try {
          JSON.parse(control.value);
        } catch (e) {
          return { jsonInvalid: true };
        }
        break;
      case 'object':
      default:
        return null;
    }
  }
  return null;
}
