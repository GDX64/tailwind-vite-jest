import { getPlanets } from './asyncDemoAPI';

export function getPlanetInfo(planet: string) {
  return new Promise<string[]>((resolve, reject) => {
    getPlanets(planet, resolve, reject);
  });
}
