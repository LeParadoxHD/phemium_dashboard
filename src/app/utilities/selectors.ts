import { createSelector } from '@ngxs/store';
import { EnvironmentsState, LoginsState } from '../state/store';
import { IEnvironmentsState, ILoginsState } from '../state/interfaces';

export function EnvironmentsWithToken() {
  return createSelector([EnvironmentsState, LoginsState], (environments: IEnvironmentsState, logins: ILoginsState) => {
    const envs = Object.assign({}, environments);
    for (const environment in envs) {
      envs[environment] = envs[environment].map((e) => {
        const slug = e.slug;
        const loginInfo = logins[slug];
        return {
          ...e,
          ...loginInfo
        };
      });
    }
    return envs;
  });
}
