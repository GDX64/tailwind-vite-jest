export interface MyCTX {
  awake(): boolean;
  dispose(): void;
}

export class CompRef<T> {
  dependents = new Set<MyCTX>();
  constructor(public value: T) {}

  set(value: T) {
    this.value = value;
    this.dependents.forEach((dep) => {
      if (!dep.awake()) {
        this.dependents.delete(dep);
      }
    });
  }

  track(ctx: MyCTX) {
    this.dependents.add(ctx);
    return this.value;
  }
}

export class Computation<T> implements MyCTX {
  dependents = new Set<MyCTX>();
  needsToRun = false;
  value: T;
  ctx: MyCTX;
  constructor(public calc: (ctx: MyCTX) => T) {
    this.ctx = this.createNewContext();
    this.value = calc(this.ctx);
  }

  private createNewContext(): MyCTX {
    return {
      awake: () => this.awake(),
      dispose() {
        this.awake = () => false;
      },
    };
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
      this.ctx.dispose();
      this.ctx = this.createNewContext();
      this.value = this.calc(this.ctx);
      this.needsToRun = false;
    }
    return this.value;
  }

  awake() {
    this.needsToRun = true;
    this.dependents.forEach((dep) => {
      if (!dep.awake()) {
        this.dependents.delete(dep);
      }
    });
    return true;
  }

  dispose(): void {}
}
