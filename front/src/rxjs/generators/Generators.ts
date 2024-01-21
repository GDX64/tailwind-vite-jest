export async function* range(n: number) {
  for (let i = 0; i < n; i++) {
    yield i;
  }
}

export async function* delayed<T>(gen: AsyncGenerator<T>, ms: number) {
  for await (const v of gen) {
    await new Promise((resolve) => setTimeout(resolve, ms));
    yield v;
  }
}

export async function* map<T, K>(
  g: AsyncGenerator<T>,
  f: (x: T) => K
): AsyncGenerator<K> {
  for await (const value of g) {
    yield f(value);
  }
}

export async function* debounce<T>(
  g: AsyncGenerator<T>,
  ticker: AsyncGenerator<T>
): AsyncGenerator<T> {
  for await (const v of g) {
  }
}

const NEVER = new Promise<never>(() => {});

export async function* merge<T>(...gens: AsyncGenerator<T>[]): AsyncGenerator<T> {
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

export async function* take<T>(g: AsyncGenerator<T>, n: number) {
  let i = 0;
  for await (const v of g) {
    if (i >= n) {
      break;
    }
    yield v;
    i += 1;
  }
  g.return(null);
}

export async function collectAsync<T>(gen: AsyncGenerator<T>): Promise<T[]> {
  const arr: T[] = [];
  for await (const v of gen) {
    arr.push(v);
  }
  return arr;
}

export function makeChannel<T>() {
  type Value = T;
  const arr: Value[] = [];
  let onNewValue = () => {};
  const next = (v: T) => {
    arr.push(v);
    onNewValue();
  };

  let completed = false;

  const complete = () => {
    onNewValue();
    completed = true;
  };

  async function* gen() {
    while (!completed) {
      if (arr.length) {
        yield arr.shift()!;
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

export function raf() {
  return new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });
}

export async function* animationFrames() {
  while (true) {
    yield await raf();
  }
}

export async function* switchGen<T>(gen: AsyncGenerator<AsyncGenerator<T>>) {
  const { done, value: first } = await gen.next();
  if (done) {
    return;
  }
  let currentGen = first;
  let nextGen = gen.next();
  let nextValue = first.next();
  let genHasMoreValues = true;
  let currentHasMoreValues = true;
  while (genHasMoreValues || currentHasMoreValues) {
    const now = await new Promise<
      | { gen: true; value: AsyncGenerator<T>; done: boolean }
      | { gen: false; value: T; done: boolean }
    >((resolve) => {
      if (genHasMoreValues) {
        nextGen.then(({ value, done }) => {
          resolve({ gen: true, value, done: done ?? false });
        });
      }
      nextValue.then(({ done, value }) => {
        resolve({ gen: false, value, done: done ?? false });
      });
    });
    if (now.gen) {
      if (now.done) {
        genHasMoreValues = false;
      } else {
        currentGen.return(null);
        currentGen = now.value;
        nextGen = gen.next();
        nextValue = currentGen.next();
      }
    } else {
      if (now.done) {
        currentHasMoreValues = false;
      } else {
        nextValue = currentGen.next();
        yield now.value;
      }
    }
  }
}

export async function* withScheduler<T>(
  gen: AsyncGenerator<T>,
  scheduler: AsyncGenerator<any>
) {
  try {
    while (true) {
      const [{ done, value }] = await Promise.all([gen.next(), scheduler.next()]);
      if (done) {
        break;
      }
      yield value as T;
    }
  } finally {
    gen.return(null);
    scheduler.return(null);
  }
}
