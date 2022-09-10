export type Vec2 = [number, number];

function dot(v: Vec2, other: Vec2) {
  return v[0] * other[0] + v[1] * other[1];
}

function add(v: Vec2, other: Vec2): Vec2 {
  return [v[0] + other[0], v[1] + other[1]];
}

function sub(v: Vec2, other: Vec2): Vec2 {
  return [v[0] - other[0], v[1] - other[1]];
}
function scale(v: Vec2, s: number): Vec2 {
  return [v[0] * s, v[1] * s];
}

function norm(v: Vec2) {
  return Math.sqrt(dot(v, v));
}

function normalize(v: Vec2) {
  return scale(v, 1 / norm(v));
}

function clampNorm(v: Vec2, abs: number) {
  return norm(v) > abs ? scale(normalize(v), abs) : v;
}

const maxAbsoluteAcc = 20;
const maxOrthogonal = 2;

export default class Missile {
  public exploded = false;
  constructor(public speed: Vec2, public pos: Vec2, private updateFn: UpdateFn) {}

  evolve(deltaT: number) {
    const { acc: calcAcc, explode } = this.updateFn({ missile: this });
    const acc = clampAcc(calcAcc, this.speed);
    const { speed, pos } = evolve(this.pos, this.speed, acc, deltaT);
    this.speed = speed;
    this.pos = pos;
    this.exploded = this.exploded || explode;
  }

  static default({ fnAcc = defaultAccFunction } = {}) {
    return new Missile([0, 0], [0, 0], fnAcc);
  }
}

const defaultAccFunction: UpdateFn = () => {
  return { acc: [1, 0] as Vec2, explode: false };
};

function evolve(pos: Vec2, speed: Vec2, acc: Vec2, deltaT: number) {
  return {
    pos: add(add(pos, scale(speed, deltaT)), scale(acc, deltaT * deltaT)),
    speed: add(speed, scale(acc, deltaT)),
  };
}

function clampAcc(acc: Vec2, speed: Vec2) {
  if (norm(speed) === 0) {
    return clampNorm(acc, maxAbsoluteAcc);
  }
  const v_n = normalize(speed);
  const projection = scale(v_n, dot(acc, v_n));
  const orthogonal = sub(acc, projection);
  const clampedOrthogonal = clampNorm(orthogonal, maxOrthogonal);
  const newAcc = add(projection, clampedOrthogonal);
  return clampNorm(newAcc, maxAbsoluteAcc);
}

type UpdateFn = (args: { missile: Missile }) => { acc: Vec2; explode: boolean };
