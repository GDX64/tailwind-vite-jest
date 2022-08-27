import { Scale } from '../pixijs/chart/Scale';

class Complex {
  constructor(public real: number, public i: number) {}

  add(other: Complex): Complex {
    return new Complex(other.real + this.real, other.i + this.i);
  }

  mul(other: Complex): Complex {
    //(a+bi)(a1+b1i) = (a*a1 + a*a1i + bi*a1 - b*b1)
    return new Complex(
      this.real * other.real - this.i * other.i,
      this.real * other.i + other.i * this.real
    );
  }

  mod(): number {
    return this.real ** 2 + this.i ** 2;
  }
}

function f(z: Complex, c: Complex): Complex {
  return z.mul(z).add(c);
}

function calcScore(c: Complex) {
  let acc = new Complex(0, 0);
  const N = 50;
  for (let i = 0; i < N; i++) {
    acc = f(acc, c);
    if (acc.mod() > 4) {
      return i / N;
    }
  }
  return 1;
}

export function drawSet(
  canvas: HTMLCanvasElement,
  region: { x0: number; y0: number; x1: number; y1: number }
) {
  performance.mark('start');
  const ctx = canvas.getContext('2d')!;
  const scaleX = new Scale(0, canvas.width, region.x0, region.x1);
  const scaleY = new Scale(canvas.height, 0, region.y0, region.y1);
  // const matrix: boolean[][] = [...Array(canvas.height)].map(() =>
  //   Array(canvas.width).fill(false)
  // );
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      const score = calcScore(new Complex(scaleX.transform(i), scaleY.transform(j)));
      const color = (1 - score) ** (2 / 5) * 255;
      ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
      ctx.fillRect(i, j, 1, 1);
    }
  }
  console.log(performance.measure('set draw', 'start').duration);
  return { scaleX, scaleY };
}
