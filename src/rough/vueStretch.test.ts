import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  Subject,
  switchMap,
} from 'rxjs';
import { computed, ComputedRef, reactive, ref } from 'vue';

describe('nested reactivity', () => {
  test('naive', () => {
    const arr = reactive([1, 0]);

    const expensiveComputation = vitest.fn((x: number) => String(x));
    const compArr = computed(() => arr.map(expensiveComputation));

    expect(compArr.value).toMatchObject(['1', '0']);
    expect(expensiveComputation).toHaveBeenCalledTimes(2);

    arr[0] = 2;
    expect(compArr.value).toMatchObject(['2', '0']);
    expect(expensiveComputation).toHaveBeenCalledTimes(4);

    arr.push(3);
    expect(compArr.value).toMatchObject(['2', '0', '3']);
    expect(expensiveComputation).toHaveBeenCalledTimes(7);
  });

  test('nestedTest', () => {
    const ref1 = ref(1);
    const ref2 = ref(0);
    const arr = reactive([ref1, ref2]);

    const expensiveComputation = vitest.fn((x: number) => String(x));
    const compArr = computed(() => {
      return arr.map((value) => computed(() => expensiveComputation(value.value)));
    });
    const flatted = flatComputed(compArr);

    expect(flatted.value).toMatchObject(['1', '0']);
    expect(expensiveComputation).toHaveBeenCalledTimes(2);

    ref1.value = 2;
    //computed is usually pull based, so the computation did no run yet
    expect(expensiveComputation).toHaveBeenCalledTimes(2);
    expect(flatted.value).toMatchObject(['2', '0']);
    expect(expensiveComputation).toHaveBeenCalledTimes(3);

    arr.push(ref(3));
    expect(flatted.value).toMatchObject(['2', '0', '3']);
    expect(expensiveComputation).toHaveBeenCalledTimes(6);
  });

  test('rxjs version', () => {
    const sub1 = new BehaviorSubject<number>(1);
    const sub2 = new BehaviorSubject<number>(0);
    const arr = new BehaviorSubject<Observable<number>[]>([sub1, sub2]);
    const expensiveComputation = vitest.fn((x: number) => String(x));
    const compArr = arr.pipe(
      map((arr) => {
        return arr.map((obs) => obs.pipe(map(expensiveComputation)));
      })
    );
    const flatted = new BehaviorSubject([] as string[]);
    compArr.pipe(switchMap((arr) => combineLatest(arr))).subscribe(flatted);

    expect(flatted.value).toMatchObject(['1', '0']);
    expect(expensiveComputation).toHaveBeenCalledTimes(2);

    sub1.next(2);
    //rxjs is push based, so the computation was already performed
    expect(expensiveComputation).toHaveBeenCalledTimes(3);
    expect(flatted.value).toMatchObject(['2', '0']);

    arr.next([sub1, sub2, new BehaviorSubject(3)]);
    expect(flatted.value).toMatchObject(['2', '0', '3']);
    expect(expensiveComputation).toHaveBeenCalledTimes(6);
  });
});

function flatComputed<T>(c: ComputedRef<ComputedRef<T>[]>): ComputedRef<T[]> {
  return computed(() => c.value.map((c) => c.value));
}
