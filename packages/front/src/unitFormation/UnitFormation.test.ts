import { range } from 'ramda';
import { Euler, EulerModified, RK4, RK4Order2 } from './UnitFormation';

describe('euler modified', () => {
  test('simple case', () => {
    //x = t**2
    //x' = 2*t
    const eulerMod = new EulerModified(1, 0.1, 0, (_, x) => -x);
    const euler = new Euler(1, 0.1, 0, (_, x) => -x);
    const rk4 = new RK4(1, 0.1, 0, (_, x) => -x);
    const resultMod = range(0, 20).map(() => eulerMod.evolve());
    const result = range(0, 20).map(() => euler.evolve());
    const resultRK4 = range(0, 20).map(() => rk4.evolve());
    // console.log(result, resultMod, resultRK4);
    //x(1) deve ser bem próximo de 1
  });
  test('order 2', () => {
    //x'' = -x
    const rk4 = new RK4Order2(1, 0, 0.05, 0, (_, x) => -x);
    const resultRK4 = range(0, 200).map(() => rk4.evolve().x);
    // console.log(resultRK4);
    expect(Math.max(...resultRK4) < 1.5).toBe(true);
    expect(Math.min(...resultRK4) > -1.5).toBe(true);
    //x(1) deve ser bem próximo de 1
  });
});
