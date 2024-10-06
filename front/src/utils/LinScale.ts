export class LinScale {
  constructor(public alpha: number, private beta: number) {}

  scale(x: number): number {
    return this.alpha * x + this.beta;
  }

  static fromPoints(x1: number, y1: number, x2: number, y2: number): LinScale {
    const alpha = (y2 - y1) / (x2 - x1);
    const beta = y1 - alpha * x1;
    return new LinScale(alpha, beta);
  }

  invert(y: number): number {
    return (y - this.beta) / this.alpha;
  }

  inverse(): LinScale {
    return new LinScale(1 / this.alpha, -this.beta / this.alpha);
  }

  applyOnX(ctx: CanvasRenderingContext2D): void {
    ctx.scale(this.alpha, 1);
    ctx.translate(this.beta, 0);
  }

  applyOnY(ctx: CanvasRenderingContext2D): void {
    ctx.scale(1, this.alpha);
    ctx.translate(0, this.beta);
  }
}
