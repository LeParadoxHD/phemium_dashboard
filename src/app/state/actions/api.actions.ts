import { Servers } from 'src/app/config';

export namespace MethodActions {
  export class GetMethods {
    static readonly type = '[Apis] Get methods';
    constructor(public server: Servers, public force: boolean = false) {}
  }
}
