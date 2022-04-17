import * as PIXI from 'pixi.js';
import { Graphics } from 'pixi.js';
import BattleMap, { Scene } from './BattleMap';
import Missile from './Missile';
import { Scale } from '../chart/Scale';
export function test(el: HTMLElement) {
  const app = new PIXI.Application({
    backgroundColor: 0xffdddd,
    height: 600,
    width: 600,
  });

  el.appendChild(app.view);
  const map = new BattleMap(0.05);
  map.addMissile(Missile.default({ fnAcc: () => [10, 10] }));
  const g = new Graphics();
  app.stage.addChild(g);
  app.ticker.add(() => drawScene(map.evolve(), g, app));
}

function drawScene(scene: Scene, g: PIXI.Graphics, app: PIXI.Application) {
  const scaleX = new Scale(0, 100, 0, app.screen.width);
  const scaleY = new Scale(0, 100, app.screen.height, 0);
  g.clear();
  scene.missiles.forEach((m) => {
    g.beginFill(0x000000, 1);
    g.drawEllipse(scaleX.transform(m.pos[0]), scaleY.transform(m.pos[1]), 6, 6);
    g.endFill();
  });
}
