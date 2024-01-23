import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

/**
 * A class that automatically unsubscribes all observables when
 * the object gets destroyed
 */
@Injectable()
export class SubSinkAdapter implements OnDestroy {
  /**The subscription sink object that stores all subscriptions */
  subs = new Subscription();

  set sink(sub: Subscription) {
    this.subs.add(sub);
  }

  /**
   * The lifecycle hook that unsubscribes all subscriptions
   * when the component / object gets destroyed
   */
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
