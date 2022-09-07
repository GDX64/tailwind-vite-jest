export class MyCTX {
  constructor(public awake: () => void) {}
  isActive = true;
}

export class CompRef<T> {
  dependents = new Set<MyCTX>();
  constructor(public value: T) {}

  set(value: T) {
    this.value = value;
    this.dependents.forEach((dep) => {
      if (dep.isActive) dep.awake();
      else this.dependents.delete(dep);
    });
  }

  track(ctx: MyCTX) {
    if (this.dependents.size > 10) {
      this.dependents.forEach((dep) => !dep.isActive && this.dependents.delete(dep));
    }
    this.dependents.add(ctx);
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
    if (this.dependents.size > 10) {
      this.dependents.forEach((dep) => !dep.isActive && this.dependents.delete(dep));
    }
    this.dependents.add(ctx);
    return this.get();
  }

  get() {
    if (this.needsToRun) {
      this.ctx.isActive = false;
      this.ctx = this.createNewContext();
      this.value = this.calc(this.ctx);
      this.needsToRun = false;
    }
    return this.value;
  }

  awake() {
    this.needsToRun = true;
    this.dependents.forEach((dep) => {
      if (dep.isActive) dep.awake();
      else this.dependents.delete(dep);
    });
    return true;
  }
}
