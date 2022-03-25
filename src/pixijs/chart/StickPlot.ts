import { Scale } from './Scale';
import * as PIXI from 'pixi.js';

export class StickPlot {
  private data = [] as Stick[];
  private range = [0, 0] as [number, number];
  private scaleY = new Scale(0, 0, 0, 0);
  private scaleX = new Scale(0, 0, 0, 0);
  constructor(private graphics: PlotGraphics) {}

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
    this.graphics.lineStyle({ color: 0x000000, width: 2 });
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

  minMaxPos() {
    if (this.data.length) {
      return { min: this.data[0].pos, max: this.data[this.data.length - 1].pos };
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

export interface Stick {
  min: number;
  max: number;
  pos: number;
}

interface Draw<T> {
  data: T;
}

type PlotGraphics = Pick<PIXI.Graphics, 'lineTo' | 'moveTo' | 'clear' | 'lineStyle'>;
