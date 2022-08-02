type Val<T> = (x: unknown) => x is T;
const isVal = (x: any): x is Val<any> => typeof x === 'function';
const optional = Symbol('s');

interface Optional {
  [optional]: true;
}

interface Validator {
  [optional]?: true;
  [k: string]: Val<any> | Validator;
}

const isNum = (x: unknown): x is number => typeof x === 'number';
const isString = (x: unknown): x is string => typeof x === 'string';

const validator = {
  a: {
    b: isNum,
    d: {
      [optional]: true,
      e: isNum,
    },
  },
  c: isString,
} as const;

type Validates<T extends Validator> = {
  -readonly [Key in keyof T as Key extends string ? Key : never]: T[Key] extends Val<
    infer A
  >
    ? A
    : T[Key] extends Validator
    ? T[Key] extends Optional
      ? Identity<Validates<T[Key]>> | undefined
      : Identity<Validates<T[Key]>>
    : never;
};

type Identity<T extends {}> = {} & {
  [P in keyof T]: T[P];
};

type Test = Validates<typeof validator>;

function validate<V extends Validator>(validator: V, x: unknown): x is Validates<V> {
  const probe = x as any;
  return Object.keys(validator).every((key: keyof V) => {
    const prop = validator[key];
    if (!(key in probe)) {
      return !isVal(prop) && prop[optional];
    }
    if (isVal(prop)) {
      return prop(probe[key]);
    }
    return validate(prop, probe[key]);
  });
}

describe('testeando', () => {
  test('simple validation', () => {
    const validator = {
      a: isNum,
      b: isString,
    } as const;
    expect(validate(validator, { a: 10, b: '10' })).toBe(true);
    expect(validate(validator, { a: 10, b: 10 })).toBe(false);
  });
  test('nested validation', () => {
    const validator = {
      a: {
        c: isNum,
        d: isString,
      },
      b: isString,
    } as const;
    expect(validate(validator, { a: { c: 2, d: 'hi' }, b: '10' })).toBe(true);
    expect(validate(validator, { a: { c: 2, d: null }, b: '10' })).toBe(false);
    expect(validate(validator, { a: { c: 2 }, b: '10' })).toBe(false);
    expect(validate(validator, { b: '10' })).toBe(false);
  });
  test('optional validation', () => {
    const validator = {
      a: {
        [optional]: true,
        c: isNum,
        d: isString,
      },
      b: isString,
    } as const;
    expect(validate(validator, { a: { c: 2, d: 'hi' }, b: '10' })).toBe(true);
    expect(validate(validator, { a: { c: 2, d: null }, b: '10' })).toBe(false);
    expect(validate(validator, { a: { c: 2 }, b: '10' })).toBe(false);
    expect(validate(validator, { b: '10' })).toBe(true);
  });
});
