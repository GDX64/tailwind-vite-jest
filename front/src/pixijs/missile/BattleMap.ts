import Missile, { Vec2 } from './Missile';
import { partition } from 'ramda';

export default class BattleMap {
  private missiles: Missile[] = [];
  constructor(private deltaT: number) {}

  addMissile(missile: Missile) {
    this.missiles.push(missile);
  }

  evolve(): Scene {
    this.missiles.forEach((missile) => missile.evolve(this.deltaT));
    const [exploded, newMissiles] = partition((m) => m.exploded, this.missiles);
    const explosions = exploded.map((m) => ({ at: m.pos }));
    this.missiles = newMissiles;
    return { missiles: this.missiles, explosions };
  }
}

export interface Scene {
  missiles: Missile[];
  explosions: Explosion[];
}

interface Explosion {
  at: Vec2;
}
