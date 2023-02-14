function* range(n: number) {
  for (let i = 0; i < n; i++) {
    yield i;
  }
}

function* map<T, K>(g: Generator<T>, f: (x: T) => K): Generator<K> {
  for (let value of g) {
    yield f(value);
  }
}

function* flatMap<T, K>(g: Generator<T>, f: (x: T) => Generator<K>): Generator<K> {
  for (let value of g) {
    yield* f(value);
  }
}

function* take<T>(g: Generator<T>, n: number) {
  let i = 0;
  for (const v of g) {
    if (i >= n) {
      return v;
    }
    yield v;
    i++;
  }
}

describe('generator operations basic', () => {
  test('generators operations', () => {
    const mapped = map(range(4), (x) => x.toString());
    expect([...mapped]).toEqual(['0', '1', '2', '3']);
  });
  test('flatmap generator', () => {
    const mapped = flatMap(range(2), (x) => range(x + 1));
    expect([...mapped]).toEqual([0, 0, 1]);
  });
  test('take gen', () => {
    const taken = take(range(10), 4);
    expect([...taken]).toEqual([0, 1, 2, 3]);
  });
});
