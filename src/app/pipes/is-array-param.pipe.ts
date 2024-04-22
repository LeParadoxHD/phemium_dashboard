import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isArrayParam'
})
export class IsArrayParamPipe implements PipeTransform {
  transform(paramType: string) {
    return paramType.endsWith('[]');
  }
}
