import { map, of, Stream, switchAll } from './Stream';

describe('stream', () => {
  test('map', () => {
    const s = new Stream<number>();
    const values = [] as string[];
    map(s, String).subscribe((x) => values.push(x));
    s.next(1);
    s.next(2);
    expect(values).toEqual(['1', '2']);
  });
  test('switchAll', () => {
    const s = new Stream<Stream<number>>();
    const values = [] as number[];
    switchAll(s).subscribe((x) => values.push(x));
    const sInner = new Stream<number>();
    s.next(sInner);
    sInner.next(1);
    sInner.next(2);
    const sInner2 = of(3, 4);
    s.next(sInner2);
    sInner.next(1);
    expect(values).toEqual([1, 2, 3, 4]);
  });
});
