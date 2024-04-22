import { FormControl } from '@angular/forms';

export type IWorkflowRulesState = {
  [env: string]: IWorkflowRules;
};

export interface IWorkflowRules {
  original: IWorkflowRulesObject;
  modified?: IWorkflowRulesObject;
  loading: boolean;
  saving: boolean;
}

export interface IWorkflowRulesObject {
  string: string;
  json?: IWorkflowRule[];
}

export interface IWorkflowRule {
  version?: number;
  description?: string;
  action?: string;
  load?: Record<string, IWorflowRuleLoadParams>;
  set?: Record<string, string>;
  where?: Record<string, string | string[] | IWorflowRuleWhereAdvanced[]>;
  do?: IWorkflowRuleAction[];
}

export type Typed<T> = {
  [K in keyof T]: FormControl<T[K]>;
};

export interface IWorflowRuleWhereAdvanced {
  greater?: number;
  less?: number;
  not?: number | string | null | boolean;
  is?: number | string | null | boolean;
}

export interface IWorkflowRuleAction {
  api: string;
  method: string;
  parameters: any[];
  delay?: number;
}

export interface IWorflowRuleLoadParams {
  api: string;
  method: string;
  parameters: any[];
}
