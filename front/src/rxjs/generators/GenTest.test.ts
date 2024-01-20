async function* range(n: number) {
  for (let i = 0; i < n; i++) {
    yield i;
  }
}

async function* delayed<T>(gen: AsyncGenerator<T>, ms: number) {
  for await (const v of gen) {
    await new Promise((resolve) => setTimeout(resolve, ms));
    yield v;
  }
}

async function* map<T, K>(g: AsyncGenerator<T>, f: (x: T) => K): AsyncGenerator<K> {
  for await (const value of g) {
    yield f(value);
  }
}

async function* debounce<T>(
  g: AsyncGenerator<T>,
  ticker: AsyncGenerator<T>
): AsyncGenerator<T> {
  for await (const v of g) {
  }
}

const NEVER = new Promise<never>(() => {});

async function* merge<T>(...gens: AsyncGenerator<T>[]): AsyncGenerator<T> {
  let arr = gens.map((g, index) => g.next().then((v) => [v, index] as const));
  let finished = 0;
  const N = gens.length;
  while (true) {
    const [result, index] = await Promise.race(arr);
    if (result.done) {
      finished += 1;
      arr[index] = NEVER;
    } else {
      yield result.value;
      arr[index] = gens[index].next().then((v) => [v, index] as const);
    }
    if (finished === N) {
      break;
    }
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

async function collectAsync<T>(gen: AsyncGenerator<T>): Promise<T[]> {
  const arr: T[] = [];
  for await (const v of gen) {
    arr.push(v);
  }
  return arr;
}

function makeChannel<T>() {
  type Value = { v: T; active: true } | { v: null; active: false };
  const arr: Value[] = [];
  let onNewValue = () => {};
  const next = (v: T) => {
    arr.push({ v, active: true });
    onNewValue();
  };

  const complete = () => {
    arr.push({ v: null, active: false });
    onNewValue();
  };

  async function* gen() {
    while (true) {
      const v = arr.shift();
      if (v) {
        if (v.active) {
          yield v.v;
        } else {
          break;
        }
      } else {
        await new Promise<void>((resolve) => {
          onNewValue = resolve;
        });
      }
    }
  }

  return {
    gen: gen(),
    next,
    complete,
  };
}

describe('channel', () => {
  test('channel basic', async () => {
    const channel = makeChannel<number>();
    channel.next(1);
    channel.next(2);
    channel.next(3);
    setTimeout(() => {
      channel.complete();
    });

    const mapped = map(channel.gen, (v) => v.toString());
    const arr = await collectAsync(mapped);
    expect(arr).toMatchObject(['1', '2', '3']);
  });

  test('channel interleave', async () => {
    const one = range(3);
    const other = range(3);
    const interleaved = merge(one, other);
    const arr = await collectAsync(interleaved);
    expect(arr).toMatchObject([0, 0, 1, 1, 2, 2]);
  });
});
