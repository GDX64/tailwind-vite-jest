import { Computed, Signal } from './SuperReactive';

describe('test superReactive', () => {
  test('reactive stuff', () => {
    const s = new Signal(0);
    const s2 = new Signal(0);
    const fn = vitest.fn((waker) => {
      return s.track(waker) + s2.track(waker);
    });
    const c = new Computed(fn);
    expect(c.read()).toBe(0);
    expect(c.read()).toBe(0);
    expect(fn).toHaveBeenCalledTimes(1);
    s.write(10);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(c.read()).toBe(10);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledTimes(2);

    s.write(3);
    expect(c.read()).toBe(3);
    expect(fn).toHaveBeenCalledTimes(3);

    // both change
    s.write(10);
    s2.write(5);
    expect(c.read()).toBe(15);
    expect(fn).toHaveBeenCalledTimes(4);

    expect(s.wakers.length).toBe(1);
  });

  test('nested', () => {
    const s = new Signal(1);
    const c1 = new Computed((waker) => s.track(waker));
    const c2 = new Computed((waker) => s.track(waker) * 10);
    const c3 = new Computed((waker) => c1.track(waker) + c2.track(waker));
    expect(c3.read()).toBe(11);
    s.write(10);
    expect(c3.read()).toBe(110);
  });
});
