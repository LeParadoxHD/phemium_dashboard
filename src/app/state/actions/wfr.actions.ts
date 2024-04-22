export namespace WorkflowRulesActions {
  export class GetRules {
    static readonly type = '[WorkflowRules] Get rules';
    constructor(public environment: string, public force: boolean = false) {}
  }
}
