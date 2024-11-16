import {
  animationFrames,
  withScheduler,
  range,
  collectAsync,
  makeChannel,
  take,
  merge,
  map,
  raf,
  switchGen,
} from './Generators';

describe('generators test', () => {
  test('switchGen', async () => {
    async function* gen() {
      async function* gen1() {
        try {
          yield 1;
          yield 2;
          yield 3;
          await new Promise((resolve) => setTimeout(resolve, 100));
          yield 4;
          console.log('i got to the end');
        } finally {
          console.log('finally');
        }
      }
      yield gen1();
      await raf();
      yield gen1();
      await raf();
      yield gen1();
    }
    const arr: number[] = [];
    for await (const v of switchGen(gen())) {
      console.log(v);
      arr.push(v);
    }
  });

  test('clear resources', async () => {
    const g = withScheduler(range(100), animationFrames());
    const arr = await collectAsync(take(g, 3));
    expect(arr).toMatchObject([0, 1, 2]);
  });

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
    const merged = merge(one, other);
    const arr = await collectAsync(take(merged, 5));
    expect(arr).toMatchObject([0, 0, 1, 1, 2]);
  });

  test('throw iter', async () => {
    async function* gen() {
      try {
        yield 1;
        yield 2;
      } catch {
        yield 3;
        yield 4;
      }
    }

    const g = gen();
    expect((await g.next()).value).toBe(1);
    expect((await g.throw(new Error())).value).toBe(3);
    expect((await g.next()).value).toBe(4);
  });
});
