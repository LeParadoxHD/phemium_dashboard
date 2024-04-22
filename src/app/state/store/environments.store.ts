import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { patch, updateItem } from '@ngxs/store/operators';
import { EnvironmentActions } from '../actions';
import { IEnvironment, IEnvironmentsState } from '../interfaces';

@State<IEnvironmentsState>({
  name: 'environments',
  defaults: {}
})
@Injectable()
export class EnvironmentsState {
  @Action(EnvironmentActions.AddEnvironment)
  addEnvironment(
    { getState, patchState }: StateContext<IEnvironmentsState>,
    { options }: EnvironmentActions.AddEnvironment
  ) {
    const { server } = options;
    const currentEnvironments = [...(getState()?.[server] || [])];
    if (currentEnvironments.length > 0) {
      if (currentEnvironments.find((env) => env.slug === options.slug)) {
        throw new Error('This name already exists');
      }
    }
    // TODO: Handle login_encrypted
    currentEnvironments.push(options);
    patchState({ [server]: currentEnvironments });
  }

  @Action(EnvironmentActions.EditEnvironment)
  editEnvironment(
    { getState, setState }: StateContext<IEnvironmentsState>,
    { environment }: EnvironmentActions.EditEnvironment
  ) {
    const { slug } = environment;
    const envType = slug.split('|')[0];
    console.log({ environment });
    const ctx = getState();
    // TODO: Handle login_encrypted
    if (envType in ctx) {
      setState(
        patch<IEnvironmentsState>({
          [envType]: updateItem<IEnvironment>((item) => item.slug === slug, environment)
        })
      );
    }
  }
}
