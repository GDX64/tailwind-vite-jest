import * as PIXI from 'pixi.js';
import { fromEvent, lastValueFrom, map, toArray } from 'rxjs';
import { Chart } from './Chart';
import { makeStickData } from './dataProvider';
import { StickPlot } from './StickPlot';

export async function createTest($el: HTMLElement) {
  const app = new PIXI.Application({ backgroundColor: 0xffffff });
  $el.appendChild(app.view);
  const graphics = new PIXI.Graphics();
  graphics.drawRect(100, 100, 300, 300);
  app.stage.addChild(graphics);
  const plot = new StickPlot(graphics);
  const data = await lastValueFrom(makeStickData().pipe(toArray()));
  plot.setData(data);
  const wheelInput = fromEvent<WheelEvent>($el, 'wheel').pipe(
    map((event) => (event.deltaY / 100) * 0.05)
  );
  const chart = new Chart({ screen: app.screen, wheelInput });
  chart.addPlot(plot);
  chart.setRange(40, 60);
  chart.updateScales({ width: app.screen.width, height: app.screen.height });
  chart.draw();
}
