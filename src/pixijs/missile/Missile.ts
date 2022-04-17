type Vec2 = [number, number];

function dot(v: Vec2, other: Vec2) {
  return v[0] * other[0] + v[1] * other[1];
}

function add(v: Vec2, other: Vec2): Vec2 {
  return [v[0] + other[0], v[1] + other[1]];
}

function scale(v: Vec2, s: number): Vec2 {
  return [v[0] * s, v[1] * s];
}

function norm(v: Vec2) {
  return Math.sqrt(dot(v, v));
}

export class Missile {
  constructor(public speed: Vec2, public pos: Vec2, private updateFn: () => Vec2) {}

  evolve(deltaT: number) {
    const acc = this.updateFn();
    const { speed, pos } = evolve(this.pos, this.speed, acc, deltaT);
    this.speed = speed;
    this.pos = pos;
  }

  static default() {
    return new Missile([0, 0], [0, 0], () => [1, 0]);
  }
}

function evolve(pos: Vec2, speed: Vec2, acc: Vec2, deltaT: number) {
  return {
    pos: add(add(pos, scale(speed, deltaT)), scale(acc, deltaT * deltaT)),
    speed: add(speed, scale(acc, deltaT)),
  };
}
