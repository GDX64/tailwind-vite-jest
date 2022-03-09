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

export class StickPlot {
  private data = [] as Stick[];
  private range = [0, 0] as [number, number];
  constructor(
    private scaleY: Scale,
    private scaleX: Scale,
    private graphics: PlotGraphics
  ) {}

  private transformData() {
    return this.data.map((stick) => {
      const min = this.scaleY.transform(stick.min);
      const max = this.scaleY.transform(stick.max);
      const pos = this.scaleX.transform(stick.pos);
      return { min, max, pos };
    });
  }

  setData(data: Stick[]) {
    this.data = data;
  }

  draw(): Draw<Stick[]> {
    this.graphics.clear();
    const transformedData = this.transformData();
    transformedData.forEach(({ min, max, pos }) => {
      this.graphics.moveTo(pos, min);
      this.graphics.lineTo(pos, max);
    });
    return { data: transformedData };
  }

  private getView(): Stick[] {
    const minIndex = this.data.findIndex((stick) => stick.pos >= this.range[0]);
    const maxIndex = this.data.findIndex((stick) => stick.pos > this.range[1]);
    return this.data.slice(
      minIndex === -1 ? 0 : minIndex,
      maxIndex === -1 ? undefined : maxIndex
    );
  }

  getMinMax() {
    const dataInView = this.getView();
    if (dataInView.length > 0) {
      return dataInView.reduce(
        (acc, stick) => ({
          min: Math.min(stick.min, acc.min),
          max: Math.max(acc.max, stick.max),
        }),
        { min: dataInView[0].min, max: dataInView[0].max }
      );
    }
    return { min: 0, max: 0 };
  }

  setRange(min: number, max: number) {
    this.range = [min, max];
  }

  updateScales(scaleX: Scale, scaleY: Scale) {
    this.scaleX = scaleX;
    this.scaleY = scaleY;
  }
}

export class Chart {
  plots = [] as StickPlot[];
  constructor(private app: PIXI.Application) {}

  updateScales() {}

  addPlot(plot: StickPlot) {
    this.plots.push(plot);
  }

  draw() {
    return this.plots.map((plot) => plot.draw());
  }
}
interface Stick {
  min: number;
  max: number;
  pos: number;
}

interface Draw<T> {
  data: T;
}

type PlotGraphics = Pick<PIXI.Graphics, 'lineTo' | 'moveTo' | 'clear'>;
