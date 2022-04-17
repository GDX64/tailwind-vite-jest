import * as PIXI from 'pixi.js';

export class Scale {
  private alpha: number;
  private k: number;
  constructor(
    public readonly fromInitial: number,
    public readonly fromFinal: number,
    public readonly toInitial: number,
    public readonly toFinal: number
  ) {
    this.alpha = (toFinal - toInitial) / (fromFinal - fromInitial);
    this.k = toInitial - fromInitial * this.alpha;
  }
  transform(value: number) {
    return this.alpha * value + this.k;
  }
}

export class ScalePair {
  constructor(private scaleX: Scale, private scaleY: Scale) {}
  scaleVec2([x, y]: [number, number]) {
    return [this.scaleX.transform(x), this.scaleY.transform(y)] as [number, number];
  }
}

export class YScale {
  private scale: Scale;
  // private container: PIXI.Container;
  private quantity: number;
  constructor({
    from,
    to,
    // container,
    quantity = 2,
  }: {
    from: [number, number];
    to: [number, number];
    // container: PIXI.Container;
    quantity?: number;
  }) {
    this.scale = new Scale(from[0], from[1], to[0], to[1]);
    // this.container = container;
    this.quantity = quantity;
  }

  transform(x: number) {
    return this.scale.transform(x);
  }

  draw() {
    const textScale = new Scale(
      0,
      this.quantity - 1,
      this.scale.fromInitial,
      this.scale.fromFinal
    );
    return [...Array(this.quantity)].map((_, index) => {
      const indexValue = textScale.transform(index);
      // const txt = new PIXI.Text(String(indexValue));
      const y = this.transform(indexValue);
      return { y, text: String(indexValue) };
    });
  }
}
