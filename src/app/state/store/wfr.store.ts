import { Injectable } from '@angular/core';
import { Action, createSelector, State, StateContext, Store } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { map, switchMap, tap } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { WorkflowRulesActions } from '../actions';
import { IWorkflowRule, IWorkflowRules, IWorkflowRulesObject, IWorkflowRulesState } from '../interfaces';
import { CustomHttpResponse } from 'src/app/interfaces';
import { NEVER } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';

@State<IWorkflowRulesState>({
  name: 'workflow_rules',
  defaults: {}
})
@Injectable()
export class WorkflowRulesState {
  constructor(private apiService: ApiService, private store: Store, private commonService: CommonService) {}

  @Action(WorkflowRulesActions.GetRules)
  getRules(
    { getState, setState }: StateContext<IWorkflowRulesState>,
    { environment, force }: WorkflowRulesActions.GetRules
  ) {
    const ctx = getState();
    if (ctx[environment] && !force) {
      return null;
    }
    setState(
      patch<IWorkflowRulesState>({
        [environment]: patch<IWorkflowRules>({
          loading: true,
          saving: false
        })
      })
    );
    return this.commonService.currentToken$.pipe(
      switchMap((token) =>
        this.apiService.request('login', 'get_user_data_by_token', [token], true).pipe(
          switchMap(({ body }: CustomHttpResponse) => {
            const customerId = body['customer_id'];
            if (!customerId) {
              return NEVER;
            }
            return this.apiService.request('customers', 'get_customer', [customerId], true).pipe(
              map(({ body }: CustomHttpResponse) => {
                const wfr = body['workflow_rules'];
                return this.processWorkflowRules(wfr);
              })
            );
          }),
          tap((wfr) =>
            setState(
              patch<IWorkflowRulesState>({
                [environment]: patch<IWorkflowRules>(wfr)
              })
            )
          )
        )
      )
    );
  }

  /**
   * Selects the modified Workflow Rules of a particular environment
   * @param env Environment to get the modified Workflow Rules of
   * @returns Modified Workflow Rules of that environment
   */
  static GetModifiedRules(env: string): (state: IWorkflowRulesState) => IWorkflowRulesObject {
    return createSelector(
      [WorkflowRulesState], // Selects Workflow Rules state

      (rules: IWorkflowRulesState) => {
        return rules[env].modified as IWorkflowRulesObject; // Selects modified Workflow Rules of the environment
      }
    );
  }

  /**
   * Selects the original Workflow Rules of a particular environment
   * @param env Environment to get the original Workflow Rules of
   * @returns Original Workflow Rules of that environment
   */
  static GetOriginalRules(env: string): (state: IWorkflowRulesState) => IWorkflowRulesObject {
    return createSelector(
      [WorkflowRulesState],
      (rules: IWorkflowRulesState) => rules[env].original as IWorkflowRulesObject
    );
  }

  /**
   * Selects the Workflow Rules state of a particular environment
   * @param env Environment to get the state of
   * @returns Workflow Rules state of that environment
   */
  static GetRulesState(env: string) {
    return createSelector(
      [WorkflowRulesState],
      (rules) => rules[env] as IWorkflowRules // Workflow Rules state of the environment
    );
  }

  /**
   * Processes Workflow Rules
   * @param workflowRules Workflow Rules as string
   * @returns Workflow Rules as object
   */
  processWorkflowRules(workflowRules: string): Omit<IWorkflowRules, 'saving'> {
    let rules: IWorkflowRule[] = null;
    try {
      // Parse Workflow Rules
      rules = JSON.parse(workflowRules); // as IWorkflowRule[]
      // Remove version item if exists
      const versionIndex = rules.findIndex((rule) => Object.keys(rule).length === 1 && rule.version);
      if (versionIndex >= 0) {
        rules.splice(versionIndex, 1);
      }
    } catch (err) {
      console.error(err);
    }
    if (rules) {
      workflowRules = rules ? JSON.stringify(rules, null, 2) : workflowRules;
    }
    return {
      loading: false,
      original: {
        string: workflowRules, // Workflow Rules as string
        json: rules // Workflow Rules as object
      },
      modified: {
        string: workflowRules, // Workflow Rules as string
        json: rules // Workflow Rules as object
      }
    };
  }
}
