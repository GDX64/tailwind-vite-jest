import * as PIXI from 'pixi.js';
import { randomColor, randRange } from './utils';
import { faker } from '@faker-js/faker';
import { autoDetectRenderer } from 'pixi.js';

export function graphicsPerf(el: HTMLCanvasElement, resolution: number) {
  const app = new PIXI.Application({
    view: el,
    resolution,
    height: 500,
    width: 500,
    background: 0xffffff,
  });
  const g = new PIXI.Graphics();
  for (let i = 0; i < 100_000; i++) {
    const range = () => randRange(0, 500);
    g.beginFill(randomColor())
      .drawRect(range(), range(), randRange(0, 50), randRange(0, 50))
      .endFill();
  }
  const tex = PIXI.RenderTexture.create({ height: 500, width: 500 });
  app.renderer.render(g, { renderTexture: tex });
  console.log(tex);
  const s = new PIXI.Sprite(tex);
  const plane = new PIXI.SimplePlane(tex);
  g.cacheAsBitmap = true;
  // app.stage.addChild(plane);
  app.stage.addChild(g);
  app.stop();
  app.render();
  return () => app.destroy();
}
