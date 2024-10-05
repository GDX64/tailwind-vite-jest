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

  mul(scalar: number): Vec2 {
    return new Vec2(this.x * scalar, this.y * scalar);
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
}
