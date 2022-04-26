import { Ref } from 'vue';
import { getPlanets, getMoonInfo } from './asyncDemoAPI';
import * as P from './PromiseAPI';
export function makeCBRequester(
  moonsView: Ref<{ name: string; distance: number }[]>,
  errMsg: Ref<string>
) {
  const onError = (err: Error) => {
    errMsg.value = err.message;
  };
  return {
    setPlanet(planet: string) {
      moonsView.value = [];
      getPlanets(
        planet,
        (moons) => {
          moons.forEach((moon) => {
            getMoonInfo(
              moon,
              ({ distance }) => {
                moonsView.value.push({ name: moon, distance });
              },
              onError
            );
          });
        },
        onError
      );
    },
  };
}

export function makePromiseRequester(
  moonsView: Ref<{ name: string; distance: number }[]>,
  errMsg: Ref<string>
) {
  return {
    async setPlanet(planet: string) {
      const result = await getMoonsDistances(planet).catch((err: Error) => {
        errMsg.value = err.message;
        return [];
      });
      moonsView.value = result;
    },
  };
}
async function getMoonsDistances(planet: string) {
  const moons = await P.getPlanetInfo(planet);
  const infos = moons.map(async (moon) => {
    const { distance } = await P.getMoonInfo(moon);
    return { distance, name: moon };
  });
  return Promise.all(infos);
}
