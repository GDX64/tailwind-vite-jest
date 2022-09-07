interface MyCTX {
  awake(): void;
}

class Computation<T> implements MyCTX {
  dependents = new Set<MyCTX>();
  needsToRun = false;
  value: T;
  constructor(public calc: (ctx: MyCTX) => T) {
    this.value = calc(this);
  }

  update(calc: (ctx: MyCTX) => T) {
    this.calc = calc;
    this.awake();
  }

  track(ctx: MyCTX) {
    this.dependents.add(ctx);
    return this.get();
  }

  get() {
    if (this.needsToRun) {
      this.value = this.calc(this);
      this.needsToRun = false;
    }
    return this.value;
  }

  awake() {
    this.needsToRun = true;
    this.dependents.forEach((dep) => dep.awake());
  }
}

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
});
