import { Pipe, PipeTransform } from '@angular/core';
import memo from 'memo-decorator';

@Pipe({
  name: 'trimArrayParam'
})
export class TrimArrayParamPipe implements PipeTransform {
  @memo()
  transform(paramType: string) {
    return paramType.replace(/(\[\])$/, '');
  }
}
