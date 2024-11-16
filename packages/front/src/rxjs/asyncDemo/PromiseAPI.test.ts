import { flushPromises } from '@vue/test-utils';
import { getPlanetInfo, getMoonInfo } from './PromiseAPI';

describe('Promises', () => {
  test('getPlanetInfo', async () => {
    vi.useFakeTimers();
    const moons = getPlanetInfo('earth');
    vi.advanceTimersByTime(1000);
    expect(await moons).toMatchObject(['moon']);
  });
  test('getPlanetInfo error', async () => {
    const moons = getPlanetInfo('abacate').catch((err: Error) => err);
    vi.advanceTimersByTime(1000);
    expect(await moons).toMatchObject(Error('No planet found with this name'));
  });
  test('chain', async () => {
    const moons = chain();
    vi.advanceTimersByTime(1000);
    await flushPromises();
    vi.advanceTimersByTime(1000);
    expect(await moons).toMatchObject({ distance: 100 });
  });
});

async function chain() {
  await getPlanetInfo('earth');
  return getMoonInfo('moon');
}
