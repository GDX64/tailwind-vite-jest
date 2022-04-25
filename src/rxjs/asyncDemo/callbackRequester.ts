import { Ref } from 'vue';
import { getPlanets } from './asyncDemoAPI';
export function makeCBRequester(moons: Ref<string[]>, distance: Ref<string>) {
  let timeout: any = -1;
  let planetID = 0;
  return {
    async setPlanet(planet: string) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        planetID++;
        const currentID = planetID;
        getPlanets(
          planet,
          (result) => {
            if (planetID === currentID) {
              moons.value = result;
            }
          },
          () => this.setPlanet(planet)
        );
      }, 250);
    },
  };
}
