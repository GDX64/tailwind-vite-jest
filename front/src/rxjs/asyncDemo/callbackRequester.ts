import { of } from 'ramda';
import { debounce, debounceTime, merge, retry, Subject, switchMap } from 'rxjs';
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
  let timeout = -1 as any;
  let cancelPlanetsRequest = () => {};
  return {
    setPlanet(planet: string) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        moonsView.value = [];
        cancelPlanetsRequest();
        cancelPlanetsRequest = getPlanetsCancelable(
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
      }, 250);
    },
  };
}

function getPlanetsCancelable(
  planet: string,
  ok: (moons: string[]) => void,
  error: (err: Error) => void
) {
  let canceled = false;
  getPlanets(planet, (moons) => !canceled && ok(moons), error);
  return () => {
    canceled = true;
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

export function makeObservableRequester(
  moonsView: Ref<{ name: string; distance: number }[]>,
  errMsg: Ref<string>
) {
  const planet$ = new Subject<string>();
  const subscription = planet$
    .pipe(
      debounceTime(200),
      switchMap((planet) => {
        return P.getPlanetInfo(planet);
      }),
      switchMap((moons) => {
        const infos = moons.map(async (moon) => {
          const { distance } = await P.getMoonInfo(moon);
          return { distance, name: moon };
        });
        return Promise.all(infos);
      }),
      retry({
        delay: (err: Error) => {
          errMsg.value = err.message;
          return of(true);
        },
      })
    )
    .subscribe((infos) => {
      moonsView.value = infos;
    });

  return {
    unsubscribe: () => subscription.unsubscribe(),
    async setPlanet(planet: string) {
      planet$.next(planet);
    },
  };
}
