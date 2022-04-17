import * as PIXI from 'pixi.js';
import { Graphics } from 'pixi.js';
import BattleMap, { Scene } from './BattleMap';
import Missile from './Missile';
import { Scale, ScalePair } from '../chart/Scale';
import { explode } from './Explosion';

export function test(el: HTMLElement) {
  new BattleDraw(el).animate();
}

class BattleDraw {
  private map: BattleMap;
  private g: PIXI.Graphics = new Graphics();
  private app: PIXI.Application;
  private explosionsContainer = new PIXI.Container();
  private scalePair: ScalePair;
  constructor(el: HTMLElement) {
    this.app = new PIXI.Application({
      backgroundColor: 0xffdddd,
      height: 900,
      width: 900,
    });
    this.scalePair = createScale(this.app.screen.width, this.app.screen.height);
    el.appendChild(this.app.view);
    this.map = new BattleMap(0.05);
    this.map.addMissile(createMissile());
    this.app.stage.addChild(this.g);
    this.app.stage.addChild(this.explosionsContainer);
  }

  animate() {
    this.app.ticker.add(() => this.drawScene(this.map.evolve()));
  }

  private drawScene(scene: Scene) {
    this.g.clear();
    scene.missiles.forEach((m) => {
      const [x, y] = this.scalePair.scaleVec2(m.pos);
      this.g.beginFill(0x000000, 1).drawEllipse(x, y, 6, 6).endFill();
    });
    scene.explosions.forEach((explosion) => {
      explode(this.explosionsContainer, this.scalePair.scaleVec2(explosion.at));
    });
  }
}

function createScale(screenWidth: number, screenHeight: number) {
  const scaleX = new Scale(0, 100, 0, screenWidth);
  const scaleY = new Scale(0, 100, screenHeight, 0);
  return new ScalePair(scaleX, scaleY);
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
