import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pagination'
})
export class PaginationPipe implements PipeTransform {
  transform(items: any[], pageIndex: number, pageSize: number): any[] {
    return [...items.slice(pageSize * (pageIndex - 1), pageSize * (pageIndex - 1) + pageSize)];
  }
}
