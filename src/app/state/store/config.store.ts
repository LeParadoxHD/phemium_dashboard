import { Injectable } from '@angular/core';
import { createSelector, State } from '@ngxs/store';
import { IConfigState } from '../interfaces';
import pkg from '../../../../package.json';

/**
 * System based settings
 */
@State<IConfigState>({
  name: 'config',
  defaults: {
    version: pkg.version
  }
})
@Injectable()
export class ConfigState {
  static GetProperty(property: keyof IConfigState) {
    return createSelector([ConfigState], (config) => config[property]);
  }
}
