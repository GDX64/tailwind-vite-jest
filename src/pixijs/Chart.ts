import * as PIXI from 'pixi.js';

function rect(g: PIXI.Graphics) {
  g.drawRect(10, 20, 100, 100);
}

export class Scale {
  alpha: number;
  k: number;
  constructor(
    fromInitial: number,
    fromFinal: number,
    toInitial: number,
    toFinal: number
  ) {
    this.alpha = (toFinal - toInitial) / (fromFinal - fromInitial);
    this.k = toInitial - fromInitial * this.alpha;
  }
  transform(value: number) {
    return this.alpha * value + this.k;
  }
}

class StickPlot {
  data = [] as Stick[];
  constructor(
    private scaleY: Scale,
    private scaleX: Scale,
    private graphics: PIXI.Graphics
  ) {}

  transformData() {
    return this.data.map((stick) => {
      const min = this.scaleY.transform(stick.min);
      const max = this.scaleY.transform(stick.max);
      const pos = this.scaleX.transform(stick.pos);
      return { min, max, pos };
    });
  }

  draw() {
    this.graphics.clear();
    this.transformData().forEach(({ min, max, pos }) => {
      this.graphics.moveTo(pos, min);
      this.graphics.lineTo(pos, max);
    });
  }
}

interface Stick {
  min: number;
  max: number;
  pos: number;
}
