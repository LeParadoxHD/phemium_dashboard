import { StateOperator } from '@ngxs/store';
import { isStateOperator } from '@ngxs/store/operators';

type NotUndefined<T> = T extends undefined ? never : T;
type _NoInfer<T> = T extends infer S ? S : never;
export type NoInfer<T> = T extends (infer O)[] ? _NoInfer<O>[] : _NoInfer<T>;
type ɵAsReadonly<T> = T extends Readonly<infer O> ? (O extends T ? Readonly<T> : T) : T;
export type ExistingState<T> = T extends any ? ɵAsReadonly<T> : never;

export type ɵPatchSpec<T> = { [P in keyof T]?: T[P] | StateOperator<NotUndefined<T[P]>> };

export function patch<T extends Record<string, any>>(patchObject: NoInfer<ɵPatchSpec<T>>): StateOperator<T> {
  return function patchStateOperator(existing: ExistingState<T>): T {
    let clone = null;
    for (const k in patchObject) {
      const newValue = patchObject[k];
      const existingPropValue = existing?.[k] || {};
      const newPropValue = isStateOperator(newValue) ? newValue(<any>existingPropValue) : newValue;
      if (newPropValue !== existingPropValue) {
        if (!clone) {
          clone = { ...(<any>existing) };
        }
        clone[k] = newPropValue;
      }
    }
    return clone || existing;
  };
}
