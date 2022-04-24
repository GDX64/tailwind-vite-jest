import { getPlanets, getMoonInfo } from './asyncDemoAPI';

describe('api', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  test('planet api', () => {
    const { ok, err } = simplePlanetAPICall('earth');
    expect(ok).toHaveBeenCalledWith(['moon']);
    expect(err).toHaveBeenCalledTimes(0);
  });
  test('planet api error', () => {
    const { ok, err } = simplePlanetAPICall('acabate');
    expect(ok).toHaveBeenCalledTimes(0);
    expect(err).toHaveBeenCalledWith(Error('No planet found with this name'));
  });

  test('moonInfo', () => {
    const { ok, err } = simpleMoonAPICall('acabate');
    expect(ok).toHaveBeenCalledTimes(0);
    expect(err).toHaveBeenCalledWith(Error('No moon found with this name'));
  });

  test('moonInfo Error', () => {
    const { ok, err } = simpleMoonAPICall('fobos');
    expect(ok).toHaveBeenCalledWith({ distance: 120 });
    expect(err).toHaveBeenCalledTimes(0);
  });
});

function simplePlanetAPICall(arg: string) {
  const ok = vi.fn();
  const err = vi.fn();
  getPlanets(arg, ok, err);
  vi.runAllTimers();
  return { ok, err };
}

function simpleMoonAPICall(arg: string) {
  const ok = vi.fn();
  const err = vi.fn();
  getMoonInfo(arg, ok, err);
  vi.runAllTimers();
  return { ok, err };
}
