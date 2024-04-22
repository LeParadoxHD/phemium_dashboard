import { Pipe, PipeTransform } from '@angular/core';
import { CommonService } from '../services/common.service';
import { Observable, map, of } from 'rxjs';
import { IApiMethod } from '../interfaces';

@Pipe({ name: 'methodsByApi' })
export class MethodsByApiPipe implements PipeTransform {
  constructor(private commonService: CommonService) {}

  transform(apiGroup: string): Observable<IApiMethod[]> {
    if (!apiGroup) {
      return of([]);
    }
    return this.commonService
      .getApiGroupWithinSelectedApi(apiGroup)
      .pipe(map((group) => group.methods));
  }
}
