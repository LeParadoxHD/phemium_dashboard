import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, fromEvent, map, Observable, shareReplay, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  menuPanelWidth$ = new BehaviorSubject<number>(300);
  debugPanelHeight$ = new BehaviorSubject<number>(200);
  previewReportPanelHeight$ = new BehaviorSubject<number>(0);

  environmentsPanelWidth$ = new BehaviorSubject<number>(300);
  requestPanelWidth$ = new BehaviorSubject<number>(null);
  maxRequestPanelWidth$: Observable<number>;

  responsePanelMinWidth: 100;

  constructor() {
    const sizes = {
      height: window.innerHeight,
      width: window.innerWidth
    };
    this.requestPanelWidth$.next(sizes.width - this.menuPanelWidth$.getValue());
    this.maxRequestPanelWidth$ = combineLatest([
      this.menuPanelWidth$.asObservable(),
      fromEvent(window, 'resize').pipe(
        startWith(null),
        map((_) => ({
          height: window.innerHeight,
          width: window.innerWidth
        }))
      )
    ]).pipe(
      map(([menuPanelWidth, sizes]) => sizes.width - menuPanelWidth - this.responsePanelMinWidth),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }
}
