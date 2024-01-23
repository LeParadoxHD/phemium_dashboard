import { IApiMethod, IViewResult } from 'src/app/interfaces';

export namespace ViewActions {
  export class AddView {
    static readonly type = '[View] Add';
    constructor(public method: IApiMethod) {}
  }
  export class RemoveView {
    static readonly type = '[View] Remove';
    constructor(public index: number | string) {}
  }
  export class UpdateViewParameters {
    static readonly type = '[View] Update parameters';
    constructor(public method: string, public parameters: any[]) {}
  }
  export class UpdateViewVirtualParameters {
    static readonly type = '[View] Update virtual parameters';
    constructor(public method: string, public parameters: Record<string, any>) {}
  }
  export class AddViewResult {
    static readonly type = '[View] Add result';
    constructor(public method: string, public result: IViewResult) {}
  }
  export class RemoveViewResult {
    static readonly type = '[View] Remove result';
    constructor(public method: string, public resultIndex: number) {}
  }
  export class PerformRequest {
    static readonly type = '[View] PerformRequest';
    constructor(public entity: string, public method: string, public parameters: any[] = []) {}
  }
  export class SetTabIndex {
    static readonly type = '[View] Set tab index';
    constructor(public index: number) {}
  }
}
