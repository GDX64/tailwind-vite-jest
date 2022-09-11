export class EulerModified {
  constructor(
    public xNow: number,
    public delta: number,
    public t: number,
    public f: (x: number, t: number) => number
  ) {}
  evolve() {
    const speed = this.f(this.t, this.xNow);
    const predicted = speed * this.delta + this.xNow;
    const avgSlope = (speed + this.f(this.t, predicted)) / 2;
    this.xNow = this.xNow + avgSlope * this.delta;
    this.t += this.delta;
    return this.xNow;
  }
}
export class Euler {
  constructor(
    public xNow: number,
    public delta: number,
    public t: number,
    public f: (x: number, t: number) => number
  ) {}
  evolve() {
    const speed = this.f(this.t, this.xNow);
    this.xNow = speed * this.delta + this.xNow;
    this.t += this.delta;
    return this.xNow;
  }
}
