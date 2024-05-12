export class Vec2 {
  constructor(public x: number, public y: number) {}

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(v: Vec2) {
    return new Vec2(this.x + v.x, this.y + v.y);
  }

  sub(v: Vec2) {
    return new Vec2(this.x - v.x, this.y - v.y);
  }

  scale(k: number) {
    return new Vec2(this.x * k, this.y * k);
  }

  dot(v: Vec2) {
    return this.x * v.x + this.y * v.y;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const l = this.length();
    if (l === 0) return new Vec2(0, 0);
    return new Vec2(this.x / l, this.y / l);
  }
}
