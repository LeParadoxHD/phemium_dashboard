import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isPrimitive'
})
export class IsPrimitivePipe implements PipeTransform {
  transform(value: string | string[], specific?: string): boolean {
    if (value) {
      if (Array.isArray(value)) {
        return value.every((v) => this.isPrimitive(v, specific));
      } else {
        return this.isPrimitive(value, specific);
      }
    }
    return false;
  }

  isPrimitive(value: string, specific?: string): boolean {
    if (specific) {
      return value === specific;
    } else {
      return ['boolean', 'bool', 'number', 'int', 'integer', 'string', 'datetime'].includes(value);
    }
  }
}
