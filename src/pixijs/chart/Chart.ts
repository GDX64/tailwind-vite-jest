import { StickPlot } from './StickPlot';
import { Scale } from './Scale';
import { Observable } from 'rxjs';
import { clamp } from 'ramda';

type Range = [number, number];

export class Chart {
  private plots = [] as StickPlot[];
  private range = [0, 0] as Range;
  constructor(private app: ChartApplication) {
    this.app.wheelInput.subscribe(this.handleWheel.bind(this));
  }

  get width() {
    return this.app.screen.width;
  }
  get height() {
    return this.app.screen.height;
  }

  private handleWheel(x: number) {
    const { minPos, maxPos } = this.getMinMax();
    const rangeSize = this.range[1] - this.range[0];
    const step = x * rangeSize;
    this.range[0] = clamp(minPos, this.range[1], this.range[0] + step);
    this.range[1] = clamp(this.range[0], maxPos, this.range[1] + step);
    this.draw();
  }

  getMinMax() {
    if (this.plots.length) {
      const max = Math.max(...this.plots.map((plot) => plot.getMinMax().max));
      const min = Math.min(...this.plots.map((plot) => plot.getMinMax().min));
      const minPos = Math.min(...this.plots.map((plot) => plot.minMaxPos().min));
      const maxPos = Math.max(...this.plots.map((plot) => plot.minMaxPos().max));
      return { min, max, minPos, maxPos };
    }
    return { min: 0, max: 0, minPos: 0, maxPos: 0 };
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
    this.updateScales({ width: this.width, height: this.height });
    return this.plots.map((plot) => plot.draw());
  }

  getRange() {
    return this.range;
  }
}

export interface ChartApplication {
  screen: {
    width: number;
    height: number;
  };
  wheelInput: Observable<number>;
}
