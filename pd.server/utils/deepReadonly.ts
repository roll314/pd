export type DeepReadonly<T> = T extends any[] ? DeepReadonlyArray<T[number]>
  : T extends object ? DeepReadonlyObject<T>
  : T;

export interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

export type DeepReadonlyObject<T> = {
  readonly [P in NonFunctionPropertyNames<T>]: DeepReadonly<T[P]>;
};

type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never
    : K;
}[keyof T];
