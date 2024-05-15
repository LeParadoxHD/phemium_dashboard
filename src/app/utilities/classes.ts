import { Injectable, OnDestroy } from '@angular/core';
import chalk from 'chalk';

const isFunction = (fn: any) => typeof fn === 'function';
export type Nullable<T> = T | null | undefined;

export interface SubscriptionLike {
  unsubscribe(): void;
}

/**
 * Subscription sink that holds Observable subscriptions
 * until you call unsubscribe on it in ngOnDestroy.
 */
@Injectable()
export class SubSinkAdapter implements OnDestroy {
  protected _subs: Nullable<SubscriptionLike>[] = [];

  /**
   * Subscription sink that holds Observable subscriptions
   * until you call unsubscribe on it in ngOnDestroy.
   *
   * @example
   * In Angular:
   * ```
   *   private subs = new SubSink();
   *   ...
   *   this.subs.sink = observable$.subscribe(...)
   *   this.subs.add(observable$.subscribe(...));
   *   ...
   *   ngOnDestroy() {
   *     this.subs.unsubscribe();
   *   }
   * ```
   */
  constructor() {}

  /**
   * Add subscriptions to the tracked subscriptions
   * @example
   *  this.subs.add(observable$.subscribe(...));
   */
  addSink(...subscriptions: Nullable<SubscriptionLike>[]) {
    this._subs = this._subs.concat(subscriptions);
  }

  /**
   * Assign subscription to this sink to add it to the tracked subscriptions
   * @example
   *  this.subs.sink = observable$.subscribe(...);
   */
  set sink(subscription: Nullable<SubscriptionLike>) {
    this._subs.push(subscription);
  }

  /**
   * Unsubscribe to all subscriptions in ngOnDestroy()
   * @example
   *   ngOnDestroy() {
   *     this.subs.unsubscribe();
   *   }
   */
  unsubscribe() {
    this._subs.forEach((sub) => sub && isFunction(sub.unsubscribe) && sub.unsubscribe());
    this._subs = [];
  }

  ngOnDestroy() {
    this.unsubscribe();
  }
}

export class Logging {
  static Log(category: string, ...message: any[]) {
    const customChalk = chalk.bgHex('#1890ff').hex('#fff').bold;
    console.log(customChalk(` ${category} `), ...message);
  }
  static Success(category: string, ...message: any[]) {
    const customChalk = chalk.bgHex('#00BF5D').hex('#fff').bold;
    console.log(customChalk(` ${category} `), ...message);
  }
  static Warning(category: string, ...message: any[]) {
    const customChalk = chalk.bgHex('#F1971D').hex('#fff').bold;
    console.warn(customChalk(` ${category} `), ...message);
  }
  static Error(category: string, ...message: any[]) {
    const customChalk = chalk.bgHex('#C60000').hex('#fff').bold;
    console.error(customChalk(` ${category} `), ...message);
  }
}
