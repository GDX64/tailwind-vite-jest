import Missile from './Missile';

export default class BattleMap {
  private missiles: Missile[] = [];
  constructor(private deltaT: number) {}

  addMissile(missile: Missile) {
    this.missiles.push(missile);
  }

  evolve(): Scene {
    this.missiles.forEach((missile) => missile.evolve(this.deltaT));
    return { missiles: this.missiles };
  }
}

export interface Scene {
  missiles: Missile[];
}
