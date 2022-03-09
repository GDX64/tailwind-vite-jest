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
  private range = [0, 0] as Range;
  constructor(
    private scaleY: Scale,
    private scaleX: Scale,
    private graphics: PlotGraphics
  ) {}

  private transformData() {
    return this.getView().map((stick) => {
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

type Range = [number, number];

export class Chart {
  private plots = [] as StickPlot[];
  private range = [0, 0] as Range;
  constructor() {}

  private getMinMax() {
    if (this.plots.length) {
      const max = Math.max(...this.plots.map((plot) => plot.getMinMax().max));
      const min = Math.min(...this.plots.map((plot) => plot.getMinMax().min));
      return { min, max };
    }
    return { min: 0, max: 0 };
  }

  public updateScales({ width = 0, height = 0 }) {
    this.plots.forEach((plot) => plot.setRange(...this.range));
    const { min, max } = this.getMinMax();
    const scaleX = new Scale(this.range[0], this.range[1], 0, width);
    const scaleY = new Scale(min, max, height, 0);
    this.plots.forEach((plot) => plot.updateScales(scaleX, scaleY));
  }

  setRange(min: number, max: number) {
    this.range = [min, max];
  }

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
