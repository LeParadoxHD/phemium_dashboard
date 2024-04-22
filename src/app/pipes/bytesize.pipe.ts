import { Pipe, PipeTransform } from '@angular/core';
import byteSize from 'byte-size';

@Pipe({
  name: 'bytesize'
})
export class BytesizePipe implements PipeTransform {
  transform(size): string {
    return byteSize(size);
  }
}
