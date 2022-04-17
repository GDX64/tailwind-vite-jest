import * as PIXI from 'pixi.js';
import { Graphics } from 'pixi.js';
import BattleMap from './BattleMap';
import { Missile } from './missile';

export function test(el: HTMLElement) {
  const app = new PIXI.Application({ backgroundColor: 0xffffff });
  el.appendChild(app.view);
  const map = new BattleMap(0.05);
  map.addMissile(Missile.default());
  const g = new Graphics();
  app.stage.addChild(g);
  app.ticker.add((delta) => {
    g.clear();
    const scene = map.evolve();
    scene.missiles.forEach((m) => {
      g.beginFill(0x000000, 1);
      g.drawCircle(m.pos[0], m.pos[1], 10);
      g.endFill();
    });
  });
}
