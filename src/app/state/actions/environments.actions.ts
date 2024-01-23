import { IEnvironment } from '../interfaces';

export namespace EnvironmentActions {
  export class AddEnvironment {
    static readonly type = '[Environments] Add environment';
    constructor(public options: IEnvironment) {}
  }
  export class EditEnvironment {
    static readonly type = '[Environments] Edit environment';
    constructor(public environment: IEnvironment) {}
  }
}
