import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  Subject,
  switchMap,
} from 'rxjs';
import { computed, ComputedRef, reactive } from 'vue';

describe('nested reactivity', () => {
  test('nestedTest', () => {
    const ref1 = reactive({ value: 1 });
    const arr = reactive([ref1]);
    const counter = vitest.fn();
    const compArr = computed(() => {
      counter();
      return arr.map((value) => computed(() => String(value.value)));
    });
    const flatted = flatComputed(compArr);
    expect(flatted.value).toMatchObject(['1']);
    ref1.value = 2;
    expect(flatted.value).toMatchObject(['2']);
    expect(counter).toHaveBeenCalledTimes(1);
    arr.push({ value: 3 });
    expect(flatted.value).toMatchObject(['2', '3']);
    expect(counter).toHaveBeenCalledTimes(2);
  });

  test('rxjs version', () => {
    const sub1 = new BehaviorSubject<number>(1);
    const arr = new BehaviorSubject<Observable<number>[]>([sub1]);
    const counter = vitest.fn();
    const compArr = arr.pipe(
      map((arr) => {
        counter();
        return arr.map((obs) => obs.pipe(map(String)));
      })
    );
    const flatted = new BehaviorSubject([] as string[]);
    compArr.pipe(switchMap((arr) => combineLatest(arr))).subscribe(flatted);
    expect(flatted.value).toMatchObject(['1']);
    sub1.next(2);
    expect(flatted.value).toMatchObject(['2']);
    expect(counter).toHaveBeenCalledTimes(1);
    arr.next([sub1, new BehaviorSubject(3)]);
    expect(flatted.value).toMatchObject(['2', '3']);
    expect(counter).toHaveBeenCalledTimes(2);
  });
});

function flatComputed<T>(c: ComputedRef<ComputedRef<T>[]>): ComputedRef<T[]> {
  return computed(() => c.value.map((c) => c.value));
}
