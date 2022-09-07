export class MyCTX {
  onDispose = [] as (() => void)[];
  constructor(public awake: () => void) {}
  dispose() {
    this.onDispose.forEach((fn) => fn());
  }
}

export class CompRef<T> {
  dependents = new Set<MyCTX>();
  constructor(public value: T) {}

  set(value: T) {
    this.value = value;
    this.dependents.forEach((dep) => dep.awake());
  }

  track(ctx: MyCTX) {
    this.dependents.add(ctx);
    ctx.onDispose.push(() => this.dependents.delete(ctx));
    return this.value;
  }
}

export class Computation<T> {
  dependents = new Set<MyCTX>();
  needsToRun = false;
  value: T;
  ctx: MyCTX;
  constructor(public calc: (ctx: MyCTX) => T) {
    this.ctx = this.createNewContext();
    this.value = calc(this.ctx);
  }

  private createNewContext(): MyCTX {
    return new MyCTX(() => this.awake());
  }

  update(calc: (ctx: MyCTX) => T) {
    this.calc = calc;
    this.awake();
  }

  track(ctx: MyCTX) {
    this.dependents.add(ctx);
    ctx.onDispose.push(() => this.dependents.delete(ctx));
    return this.get();
  }

  get() {
    if (this.needsToRun) {
      this.ctx.dispose();
      this.ctx = this.createNewContext();
      this.value = this.calc(this.ctx);
      this.needsToRun = false;
    }
    return this.value;
  }

  awake() {
    this.needsToRun = true;
    this.dependents.forEach((dep) => dep.awake());
  }
}
