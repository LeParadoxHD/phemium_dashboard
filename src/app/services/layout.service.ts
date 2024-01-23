import { Injectable } from '@angular/core';
import { MonacoEditorConstructionOptions } from '@materia-ui/ngx-monaco-editor';
import { Store } from '@ngxs/store';
import { BehaviorSubject, combineLatest, fromEvent, map, Observable, shareReplay, startWith } from 'rxjs';
import { SettingsState } from '../state/store';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  menuPanelWidth$ = new BehaviorSubject<number>(300);
  debugPanelHeight$ = new BehaviorSubject<number>(200);

  environmentsPanelWidth$ = new BehaviorSubject<number>(300);
  requestPanelWidth$ = new BehaviorSubject<number>(null);
  maxRequestPanelWidth$: Observable<number>;

  responsePanelMinWidth: 100;

  constructor(private _store: Store) {
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

  getEditorOptions(options: MonacoEditorConstructionOptions = {}): Observable<MonacoEditorConstructionOptions> {
    return this._store.select<boolean>(SettingsState.GetProperty('dark_theme')).pipe(
      map((darkTheme) => {
        return {
          theme: darkTheme ? 'vs-dark' : 'vs-light',
          language: 'json',
          lineNumbers: 'off',
          readOnly: true,
          tabSize: 2,
          renderWhitespace: 'none',
          fontFamily: 'Roboto Mono Medium Regular',
          minimap: {
            enabled: false
          },
          guides: {
            indentation: false
          },
          ...options
        };
      })
    );
  }
}
