import * as API from './asyncDemoAPI';

export function getPlanetInfo(planet: string) {
  return new Promise<string[]>((resolve, reject) => {
    API.getPlanets(planet, resolve, reject);
  });
}

export function getMoonInfo(planet: string) {
  return new Promise<{ distance: number }>((resolve, reject) => {
    API.getMoonInfo(planet, resolve, reject);
  });
}
