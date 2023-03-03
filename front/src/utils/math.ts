import { mat2, vec2 } from 'gl-matrix';

export function randomColor() {
  const randByte = () => Math.floor(Math.random() * 256);
  return randByte() | (randByte() << 8) | (randByte() << 16);
}

export function randRange(start: number, finish: number): number {
  return Math.random() * (finish - start) + start;
}

export interface Point2D {
  x: number;
  y: number;
}

export function bilinearInterpolation(
  [[x1, x2], [y1, y2]]: [vec2, vec2],
  [f11, f12, f21, f22]: [number, number, number, number]
) {
  const k = (x2 - x1) * (y2 - y1);
  return (x: number, y: number) => {
    if (k === 0) return 0;
    return (
      (f11 * (x2 - x) * (y2 - y) +
        f12 * (x - x1) * (y2 - y) +
        f21 * (x2 - x) * (y - y1) +
        f22 * (x - x1) * (y - y1)) /
      k
    );
  };
}
