export namespace ReportsActions {
  export class GetReports {
    static readonly type = '[Reports] Get all';
    constructor(public environment: string, public force: boolean = false) {}
  }
  export class SetSelectedDocument {
    static readonly type = '[Reports] Set selected document';
    constructor(public documentId: number) {}
  }
}
