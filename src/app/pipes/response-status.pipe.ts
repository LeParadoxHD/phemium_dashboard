import { Pipe, PipeTransform } from '@angular/core';
import { ILog } from '../state/interfaces';

@Pipe({
  name: 'responseStatus'
})
export class ResponseStatusPipe implements PipeTransform {
  transform(log: ILog): 'success' | 'error' | 'warning' {
    if (log.statusCode.toString().startsWith('4') || log.response?.body?.error) {
      return 'error';
    }
    if (log.statusCode.toString().startsWith('5') || log.statusCode.toString().startsWith('3')) {
      return 'warning';
    }
    return 'success';
  }
}
