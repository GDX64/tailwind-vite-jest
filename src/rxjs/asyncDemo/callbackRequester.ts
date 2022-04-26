import { Ref } from 'vue';
import { getPlanets, getMoonInfo } from './asyncDemoAPI';
export function makeCBRequester(moonsView: Ref<{ name: string; distance: number }[]>) {
  return {
    setPlanet(planet: string) {
      getPlanets(planet, (moons) => {
        moons.forEach((moon) => {
          getMoonInfo(moon, ({ distance }) => {
            moonsView.value.push({ name: moon, distance });
          });
        });
      });
    },
  };
}
