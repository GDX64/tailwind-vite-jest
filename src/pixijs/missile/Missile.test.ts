import Missile from './Missile';

describe('missile', () => {
  test('should go straight up', () => {
    const m = Missile.default();
    [...Array(10)].forEach(() => m.evolve(1));
    expect(m.pos[1]).toBe(0);
    expect(m.speed[1]).toBe(0);
    expect(m.pos[0]).toBeGreaterThan(0);
  });
});
