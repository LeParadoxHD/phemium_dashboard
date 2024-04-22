import { ILog, ILogsState } from '../interfaces';

export namespace LogActions {
  export class Add {
    static readonly type = '[Logs] Add';
    constructor(public log: ILog) {}
  }

  export class ChangeLimit {
    static readonly type = '[Logs] Change limit';
    constructor(public limit: number) {}
  }

  export class ChangeFilter {
    static readonly type = '[Logs] Change filter';
    constructor(public filter: ILogsState['filter']) {}
  }
}
