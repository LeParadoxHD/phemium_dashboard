import { IParam } from '../edit-parameters/edit-parameters.component';
import { isNumeric } from './validators';

interface ParseNumberOptions {
  returnValueIfFails?: any;
}
export function parseNumber(value: any, options?: ParseNumberOptions): number {
  options ||= {};
  switch (typeof value) {
    case 'number':
      return value;
    case 'string':
    default:
      if (isNumeric(value)) {
        return parseInt(value, 10);
      }
      if ('returnValueIfFails' in options) {
        return options.returnValueIfFails;
      }
      return value;
  }
}

interface ParseStringOptions {
  parsePrimitives?: boolean;
}
export function parseString(value: any, options?: ParseStringOptions): any {
  options ||= {};
  options.parsePrimitives ||= false;
  value = value.toString();
  if (options.parsePrimitives) {
    switch (value) {
      case 'null':
        return null;
      case 'undefined':
        return undefined;
      case 'false':
        return false;
      case 'true':
        return true;
      default:
        return value;
    }
  }
}

export function parseBoolean(value: any) {
  switch (typeof value) {
    case 'boolean':
      return value;
    case 'string':
      if (value === 'true') {
        return true;
      }
      if (value === 'false') {
        return false;
      }
      return value;
    default:
      return value;
  }
}

export function parseParameter(param: IParam) {
  if (param.null) {
    return null;
  }
  switch (param.type) {
    case 'integer':
    case 'int':
    case 'number':
      return parseNumber(param.value);
    case 'string':
      return parseString(param.value);
    case 'boolean':
    case 'bool':
      return parseBoolean(param.value);
    default:
      return param.value;
  }
}
