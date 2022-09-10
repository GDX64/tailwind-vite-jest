import { combineSignals, Signal } from './Signal';
import { Stream } from './Stream';

describe('Signal', () => {
  test('combine', () => {
    const s1Fn = vitest.fn(() => 1);
    const s2Fn = vitest.fn(() => 1);
    const s1 = new Signal(s1Fn);
    const s2 = new Signal(s2Fn);
    const s3 = combineSignals((x: number, y: number) => x + y, s1, s2);
    expect(s3.getValue()).toBe(2);
    s1.clearCache();
    s1Fn.mockReturnValue(2);
    expect(s3.getValue()).toBe(3);
    expect(s1Fn).toHaveBeenCalledTimes(2);
    expect(s2Fn).toHaveBeenCalledTimes(1);
  });

  test('fromStream()', () => {
    const stream = new Stream<number>();
    const signal = Signal.fromStream(stream, 0);
    expect(signal.getValue()).toBe(0);
    stream.next(10);
    expect(signal.getValue()).toBe(10);
    const mapped = combineSignals((x: number) => String(x), signal);
    expect(mapped.getValue()).toBe('10');
    stream.next(2);
    expect(mapped.getValue()).toBe('2');
  });

  test('combine fromStream', () => {
    const stream1 = new Stream<number>();
    const stream2 = new Stream<number>();
    const signal1 = Signal.fromStream(stream1, 0);
    const signal2 = Signal.fromStream(stream2, 0);
    const mapped = combineSignals((x: number, y: number) => x + y, signal1, signal2);
    expect(mapped.getValue()).toBe(0);
    stream1.next(5);
    expect(mapped.getValue()).toBe(5);
    stream2.next(5);
    expect(mapped.getValue()).toBe(10);
  });
});
