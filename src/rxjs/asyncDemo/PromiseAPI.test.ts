import { getPlanetInfo } from './PromiseAPI';

describe('Promises', () => {
  test('getPlanetInfo', async () => {
    const moons = await getPlanetInfo('earth');
    expect(moons).toMatchObject(['moon']);
  });
  test('getPlanetInfo error', async () => {
    const moons = await getPlanetInfo('abacate').catch((err: Error) => err);
    expect(moons).toMatchObject(Error('No planet found with this name'));
  });
});
