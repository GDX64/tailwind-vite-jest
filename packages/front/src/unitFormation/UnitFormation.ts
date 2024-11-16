export class EulerModified {
  constructor(
    public xNow: number,
    public delta: number,
    public t: number,
    public f: (x: number, t: number) => number
  ) {}
  evolve() {
    const speed = this.f(this.xNow, this.t);
    const predicted = speed * this.delta + this.xNow;
    const avgSlope = (speed + this.f(predicted, this.t + this.delta)) / 2;
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
export class EulerOrder2 {
  constructor(
    public x: number,
    public v: number,
    public dt: number,
    public t: number,
    public f: (x: number, t: number) => number
  ) {}
  evolve() {
    const dv = this.f(this.t, this.x) * this.dt;
    this.v += dv;
    this.x += this.v * this.dt;
    this.t += this.dt;
    return this;
  }
}

export class RK4 {
  constructor(
    public xNow: number,
    public delta: number,
    public t: number,
    public f: (x: number, t: number) => number
  ) {}

  evolve() {
    const k1 = this.f(this.t, this.xNow) * this.delta;
    const k2 = this.f(this.t + this.delta / 2, this.xNow + k1 / 2) * this.delta;
    const k3 = this.f(this.t + this.delta / 2, this.xNow + k2 / 2) * this.delta;
    const k4 = this.f(this.t + this.delta, this.xNow + k3) * this.delta;
    this.xNow = this.xNow + (this.delta * (k1 + 2 * k2 + 2 * k3 + k4)) / 6;
    this.t += this.delta;
    return this.xNow;
  }
}
export class RK4Order2 {
  constructor(
    public x: number,
    public v: number,
    public dt: number,
    public t: number,
    public f: (t: number, x: number) => number
  ) {}

  evolve() {
    const dt = this.dt;
    const t = this.t;
    const dv1 = this.f(t, this.x) * dt;
    const dx1 = dt * this.v;

    const dv2 = this.f(t + dt / 2, this.x + dx1 / 2) * dt;
    const dx2 = dt * (this.v + dv1 / 2);

    const dx3 = dt * (this.v + dv2 / 2);
    const dv3 = this.f(t + dt / 2, this.x + dx2 / 2) * dt;

    const dx4 = dt * (this.v + dv3);
    const dv4 = this.f(t + dt, this.x + dx3) * dt;

    const dv = (dv1 + 2 * dv2 + 2 * dv3 + dv4) / 6;
    const dx = (dx1 + 2 * dx2 + 2 * dx3 + dx4) / 6;
    this.x += dx;
    this.v += dv;
    this.t += dt;
    return this;
  }
}

export type V2 = [number, number];

export function square([x, y]: V2) {
  return x * x + y * y;
}
export function add([x1, y1]: V2, [x2, y2]: V2): V2 {
  return [x1 + x2, y1 + y2];
}
export function scale(s: number, [x, y]: V2): V2 {
  return [x * s, y * s];
}

export function norm([x, y]: V2) {
  return Math.sqrt(square([x, y]));
}

export function normalized([x, y]: V2): V2 {
  const d = norm([x, y]);
  if (d === 0) {
    return [0, 0];
  }
  return [x / d, y / d];
}

export class EulerSystem {
  t = 0;
  acc = [] as V2[];
  constructor(
    public points: V2[],
    public v: V2[],
    public dt: number,
    public f: (points: V2[], speed: V2[]) => V2[]
  ) {}

  evolve() {
    this.acc = this.f(this.points, this.v);
    const dv = this.acc.map((acc) => scale(this.dt, acc));
    this.v = this.v.map((v, index) => add(v, dv[index]));
    this.points = this.points.map((point, index) =>
      add(point, scale(this.dt, this.v[index]))
    );
    this.t += this.dt;
    return this;
  }
}
