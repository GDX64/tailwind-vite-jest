import { Computation, MyCTX } from './MyVue';

describe('computation', () => {
  test('compute sanity', () => {
    const spy = vitest.fn(() => 10);
    const comp = new Computation(spy);
    expect(comp.get()).toBe(10);
    expect(comp.get()).toBe(10);
    expect(spy).toHaveBeenCalledTimes(1);
  });
  test('compute change', () => {
    const spy = vitest.fn(() => 10);
    const comp = new Computation(spy);
    expect(comp.get()).toBe(10);
    comp.update(() => 1);
    expect(comp.get()).toBe(1);
  });
  test('compute track', () => {
    const comp = new Computation(() => 10);
    const comp2 = new Computation((ctx) => comp.track(ctx) * 2);
    expect(comp2.get()).toBe(20);
    comp.update(() => 5);
    expect(comp2.get()).toBe(10);
  });
  test('compute dispose', () => {
    const comp = new Computation(() => 10);
    const comp2 = new Computation(() => 1);
    const spy = vitest.fn((ctx: MyCTX) => {
      if (comp.track(ctx) > 5) {
        return comp2.track(ctx);
      }
      return 0;
    });
    const comp3 = new Computation(spy);

    expect(comp3.get()).toBe(1);
    expect(spy).toHaveBeenCalledTimes(1);

    comp.update(() => 5);
    expect(comp3.get()).toBe(0);
    expect(spy).toHaveBeenCalledTimes(2);

    comp2.update(() => 100);
    expect(comp3.get()).toBe(0);
    expect(spy).toHaveBeenCalledTimes(2);

    comp.update(() => 6);
    expect(comp3.get()).toBe(100);
    expect(spy).toHaveBeenCalledTimes(3);

    comp2.update(() => 11);
    expect(comp3.get()).toBe(11);
    expect(spy).toHaveBeenCalledTimes(4);
  });
});
