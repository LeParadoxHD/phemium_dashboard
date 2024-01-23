import { Pipe, PipeTransform } from '@angular/core';
import memo from 'memo-decorator';

@Pipe({
  name: 'isArrayParam'
})
export class IsArrayParamPipe implements PipeTransform {
  @memo()
  transform(paramType: string) {
    return paramType.endsWith('[]');
  }
}
