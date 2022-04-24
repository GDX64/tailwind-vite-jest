const data: Record<string, Record<string, { distance: number }>> = {
  mars: {
    fobos: { distance: 120 },
    deimos: { distance: 80 },
  },
  earth: { moon: { distance: 100 } },
};

export function getPlanets(
  planet: string,
  ok: (moons: string[]) => void,
  err: (err: Error) => void
) {
  setTimeout(() => {
    if (planet in data) {
      ok(Object.keys(data[planet]));
    } else {
      err(Error('No planet found with this name'));
    }
  }, 100);
}

export function getMoonInfo(
  moon: string,
  ok: (moons: { distance: number }) => void,
  err: (err: Error) => void
) {
  setTimeout(() => {
    const moons = Object.fromEntries(
      Object.values(data).flatMap((moonRecord) => Object.entries(moonRecord))
    );
    if (moon in moons) {
      ok(moons[moon]);
    } else {
      err(Error('No moon found with this name'));
    }
  }, 100);
}
