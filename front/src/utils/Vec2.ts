export class Vec2 {
  constructor(public x: number, public y: number) {}

  static new(x: number, y: number): Vec2 {
    return new Vec2(x, y);
  }

  add(v: Vec2): Vec2 {
    return new Vec2(this.x + v.x, this.y + v.y);
  }

  sub(v: Vec2): Vec2 {
    return new Vec2(this.x - v.x, this.y - v.y);
  }

  distanceTo(v: Vec2): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  mul(scalar: number): Vec2 {
    return new Vec2(this.x * scalar, this.y * scalar);
  }

  normalize(): Vec2 {
    const length = this.length();
    if (!length) {
      return new Vec2(0, 0);
    }
    return new Vec2(this.x / length, this.y / length);
  }

  div(scalar: number): Vec2 {
    return new Vec2(this.x / scalar, this.y / scalar);
  }

  dot(v: Vec2): number {
    return this.x * v.x + this.y * v.y;
  }

  length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  subScalar(scalar: number): Vec2 {
    return new Vec2(this.x - scalar, this.y - scalar);
  }

  addScalar(scalar: number): Vec2 {
    return new Vec2(this.x + scalar, this.y + scalar);
  }

  clone(): Vec2 {
    return new Vec2(this.x, this.y);
  }
}
