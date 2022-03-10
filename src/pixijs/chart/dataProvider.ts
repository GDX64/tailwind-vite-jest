import { map, range } from 'rxjs';

export function makeStickData() {
  return range(100).pipe(
    map((index) => {
      const value1 = Math.random();
      const value2 = Math.random();
      return {
        min: Math.min(value1, value2),
        max: Math.max(value1, value2),
        pos: index,
      };
    })
  );
}
