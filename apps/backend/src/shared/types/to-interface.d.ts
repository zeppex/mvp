import type { Dayjs } from 'dayjs';

export type PublicInterface<T> = TypeConstraints<ExcludeMethods<T>>;

type ExcludeMethods<T> = {
  [P in keyof T as T[P] extends Function ? never : P]: T[P];
};

type TypeConstraints<T> = {
  [K in keyof T]: T[K] extends Date
    ? Date
    : T[K] extends Dayjs
      ? Date
      : T[K] extends Array<infer R>
        ? Array<PublicInterface<R>>
        : T[K] extends Object
          ? PublicInterface<T[K]>
          : T[K];
};
