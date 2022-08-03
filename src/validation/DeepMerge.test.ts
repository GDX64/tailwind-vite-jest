import { mergeRight, zip } from 'ramda';

type Merge<T extends Record<string, any>, G extends Record<string, any>> = {
  [Key in keyof T | keyof G]: Key extends keyof G
    ? G[Key]
    : Key extends keyof T
    ? T[Key]
    : never;
};

type MergeDeep<T extends Record<string, any>, G extends Record<string, any>> = {
  [Key in keyof T | keyof G]: Key extends keyof G & keyof T
    ? G[Key] extends Record<string, any>
      ? T[Key] extends Record<string, any>
        ? Identity<MergeDeep<T[Key], G[Key]>>
        : G[Key]
      : G[Key]
    : Key extends keyof G
    ? G[Key]
    : Key extends keyof T
    ? T[Key]
    : never;
};

type Identity<T extends {}> = {} & {
  [P in keyof T]: T[P];
};

type A = MergeDeep<
  { a: 10; b: string; h: { v: number; a: 7 }; j: 10 },
  { b: 5; c: string; h: { v: string; v2: 8 }; j: { a: 10 } }
>;

type Zip<T, U> = T extends [infer T1, ...infer T2]
  ? U extends [infer U1, ...infer U2]
    ? [[T1, U1], ...Zip<T2, U2>]
    : []
  : [];

type R = Zip<[1,3], [2,4]>

type FromEntries<T> = T extends [[infer Key extends string, infer Value], ...infer Tail]?Identity<{[K in Key]: Value} & FromEntries<Tail>>:{}

type R2 = FromEntries<[['1', 0], ['3', number]]>