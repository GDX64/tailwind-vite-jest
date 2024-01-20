import {
  animationFrames,
  withScheduler,
  range,
  collectAsync,
  makeChannel,
  take,
  merge,
  map,
} from './Generators';

describe('channel', () => {
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
