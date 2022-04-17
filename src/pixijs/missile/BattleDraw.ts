import * as PIXI from 'pixi.js';
import { Graphics } from 'pixi.js';
import BattleMap, { Scene } from './BattleMap';
import Missile from './Missile';
import { Scale, ScalePair } from '../chart/Scale';
import { explode } from './Explosion';
export function test(el: HTMLElement) {
  const app = new PIXI.Application({
    backgroundColor: 0xffdddd,
    height: 900,
    width: 900,
  });

  el.appendChild(app.view);
  const map = new BattleMap(0.05);
  map.addMissile(createMissile());
  const g = new Graphics();
  app.stage.addChild(g);
  const explosionsContainer = new PIXI.Container();
  app.stage.addChild(explosionsContainer);
  app.ticker.add(() => drawScene(map.evolve(), g, app, explosionsContainer));
}

function drawScene(
  scene: Scene,
  g: PIXI.Graphics,
  app: PIXI.Application,
  explosionsContainer: PIXI.Container
) {
  const scaleX = new Scale(0, 100, 0, app.screen.width);
  const scaleY = new Scale(0, 100, app.screen.height, 0);
  const scalePair = new ScalePair(scaleX, scaleY);
  g.clear();
  scene.missiles.forEach((m) => {
    g.beginFill(0x000000, 1);
    const [x, y] = scalePair.scaleVec2(m.pos);
    g.drawEllipse(x, y, 6, 6);
    g.endFill();
  });
  scene.explosions.forEach((explosion) => {
    explode(explosionsContainer, scalePair.scaleVec2(explosion.at));
  });
}

function createMissile() {
  return Missile.default({
    fnAcc(m) {
      if (m.missile.pos[0] > 50) {
        return { acc: [0, 0], explode: true };
      }
      return { acc: [10, 10], explode: false };
    },
  });
}
