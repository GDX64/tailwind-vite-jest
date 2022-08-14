import { map, Stream, switchAll } from './Stream';

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
    const sInner2 = new Stream<number>();
    s.next(sInner2);
    sInner.next(3);
    sInner2.next(4);
    sInner2.next(5);
    sInner.next(6);
    expect(values).toEqual([1, 2, 4, 5]);
  });
});
