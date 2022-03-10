import * as PIXI from 'pixi.js';
import { makeStickData } from './dataProvider';
import { lastValueFrom, toArray } from 'rxjs';
import { StickPlot } from './StickPlot';
import { Scale } from './Scale';

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

export async function createTest($el: HTMLElement) {
  const app = new PIXI.Application({ backgroundColor: 0xffffff });
  $el.appendChild(app.view);
  const graphics = new PIXI.Graphics();
  graphics.drawRect(100, 100, 300, 300);
  app.stage.addChild(graphics);
  const plot = new StickPlot(graphics);
  const data = await lastValueFrom(makeStickData().pipe(toArray()));
  plot.setData(data);
  const chart = new Chart();
  chart.addPlot(plot);
  chart.setRange(0, 100);
  chart.updateScales({ width: app.screen.width, height: app.screen.height });
  chart.draw();
}
