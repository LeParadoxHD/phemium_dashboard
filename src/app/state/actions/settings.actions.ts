import { ISettingsState } from '../interfaces';

export namespace SettingsActions {
  export class SetProperty {
    static readonly type = '[Settings] Set property';
    constructor(public property: keyof ISettingsState, public value: any) {}
  }
  export class SetProperties {
    static readonly type = '[Settings] Set properties';
    constructor(public changes: Partial<ISettingsState>) {}
  }
}
