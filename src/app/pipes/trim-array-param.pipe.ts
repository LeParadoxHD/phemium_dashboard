import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trimArrayParam'
})
export class TrimArrayParamPipe implements PipeTransform {
  transform(paramType: string) {
    return paramType.replace(/(\[\])$/, '');
  }
}
