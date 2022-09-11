import { range } from 'ramda';
import { Euler, EulerModified } from './UnitFormation';

describe('euler modified', () => {
  test('simple case', () => {
    //x = t**2
    //x' = 2*t
    const eulerMod = new EulerModified(1, 0.1, 0, (_, x) => -x);
    const euler = new Euler(1, 0.1, 0, (_, x) => -x);
    const resultMod = range(0, 20).map(() => eulerMod.evolve());
    const result = range(0, 20).map(() => euler.evolve());
    // console.log(result, resultMod);
    //x(1) deve ser bem próximo de 1
  });
});
