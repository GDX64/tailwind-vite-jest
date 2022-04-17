import BattleMap from './BattleMap';
import { Missile } from './missile';

describe('map', () => {
  test('scene', () => {
    const map = new BattleMap(0.01);
    map.addMissile(Missile.default());
    const scene = map.evolve();
    expect(scene.missiles).toHaveLength(1);
    expect(scene.missiles[0].speed[0]).toBeGreaterThan(0);
  });
});
