import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Store } from '@ngxs/store';
import { IEnvironment, IEnvironmentsState } from '../state/interfaces';
import { EnvironmentsState } from '../state/store';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsService {
  constructor(private _store: Store) {}

  DuplicatedEnvironmentName(environmentType: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      console.log({ value });
      if (value) {
        const environments = [].concat.apply([], Object.values(this._store.selectSnapshot(EnvironmentsState) as IEnvironmentsState)) as IEnvironment[];
        if (environments.find((env) => env.name === value && env.env === environmentType)) {
          return { name: true };
        }
      }
      return null;
    };
  }

  DuplicatedEnvironmentCustomer(environmentType: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      console.log({ value });
      if (value) {
        const environments = [].concat.apply([], Object.values(this._store.selectSnapshot(EnvironmentsState) as IEnvironmentsState)) as IEnvironment[];
        if (environments.find((env) => env.login_user === value && env.env === environmentType)) {
          return { login_user: true };
        }
      }
      return null;
    };
  }
}
