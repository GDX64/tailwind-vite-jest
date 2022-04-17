import Missile from './Missile';

describe('missile', () => {
  test('should go straight up', () => {
    const m = Missile.default();
    [...Array(10)].forEach(() => m.evolve(1));
    expect(m.pos[1]).toBe(0);
    expect(m.speed[1]).toBe(0);
    expect(m.pos[0]).toBeGreaterThan(0);
  });

  test('acc clamp', () => {
    const m = Missile.default({ fnAcc: () => [50, 50] });
    m.evolve(1);
    m.evolve(1);
    expect(m.speed[0]).toBeCloseTo(40 / Math.sqrt(2));
    expect(m.speed[1]).toBeCloseTo(40 / Math.sqrt(2));
  });
});
