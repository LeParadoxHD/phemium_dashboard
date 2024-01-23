export namespace LoginActions {
  export class InitializeEnvironment {
    static readonly type = '[Login] Initialize environment';
    constructor(public environment: string) {}
  }
  export class LoginCustomer {
    static readonly type = '[Login] Login customer';
    constructor(public environment: string, public force: boolean = false) {}
  }
  export class SetToken {
    static readonly type = '[Login] Set token';
    constructor(public environment: string, public token: string) {}
  }
}
