import { Ref } from 'vue';
import { getPlanets, getMoonInfo } from './asyncDemoAPI';
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
