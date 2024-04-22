import { Pipe, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, map, of, switchMap, tap, timer } from 'rxjs';
import { format } from 'timeago.js';

@Pipe({
  name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {
  ticker$ = new BehaviorSubject(1000);

  transform(datetime: number): Observable<string | boolean> {
    if (!datetime) {
      return of(false);
    }
    return this.ticker$.pipe(
      switchMap((tick) => timer(0, tick)),
      map(() => format(datetime)),
      tap(() => {
        const newTicker = this.calculateTicker(datetime);
        if (newTicker !== this.ticker$.getValue()) {
          this.ticker$.next(newTicker);
        }
      })
    );
  }

  calculateTicker(datetime: number) {
    const difference = Date.now() - datetime;
    let tick = 1000;
    if (difference < 60) {
      tick = 1000 * 3;
    } else if (difference < 60 * 60) {
      tick = 1000 * 60;
    } else {
      tick = 1000 * 60 * 60;
    }
    return tick;
  }
}
