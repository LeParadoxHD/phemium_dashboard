import { Pipe, PipeTransform } from '@angular/core';
import { IApiMethod, IApiMethodGroup } from '../interfaces';
import { Observable } from 'rxjs';
import { CommonService } from '../services/common.service';

@Pipe({
  name: 'getMethod'
})
export class GetMethodPipe implements PipeTransform {
  constructor(private commonService: CommonService) {}

  transform(
    groupName: IApiMethodGroup['name'],
    methodName: IApiMethod['name']
  ): Observable<IApiMethod> {
    if (!groupName || !methodName) {
      return null;
    }
    return this.commonService.getApiMethodWithinSelectedApiAndGroup(groupName, methodName);
  }
}
