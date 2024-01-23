import { Environments } from 'src/app/config';

export namespace MethodActions {
  export class GetMethods {
    static readonly type = '[Apis] Get methods';
    constructor(
      public environment: Environments,
      public force: boolean = false
    ) {}
  }
}
