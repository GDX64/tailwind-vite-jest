import { combineStreams, map, of, Stream, switchAll } from './Stream';

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

  test('combine all', () => {
    const s1 = new Stream<number>();
    const s2 = new Stream<number>();
    const combined = combineStreams((x: number, y: number) => x + y, s1, s2);
    const values = [] as number[];
    combined.subscribe((x) => {
      values.push(x);
    });
    expect(values).toEqual([]);
    s1.next(1);
    s2.next(2);
    expect(values).toEqual([3]);
    s2.next(3);
    expect(values).toEqual([3, 4]);
  });
});
