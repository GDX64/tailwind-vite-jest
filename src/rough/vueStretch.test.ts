import { BehaviorSubject, combineLatest, map, Observable, switchMap } from 'rxjs';
import { memoizeWith } from 'ramda';
import { computed, ComputedRef, reactive, ref } from 'vue';

describe('nested reactivity', () => {
  test('naive', () => {
    //using reactive() makes vue track changes to this array
    const arr = reactive([1, 0]);

    const expensiveComputation = vitest.fn((x: number) => String(x));
    const compArr = computed(() => arr.map(expensiveComputation));

    //accessing compArr.value makes vue call the function we wrote above
    //computed is usualy lazy, it will perform the calculation only
    //when we need it
    expect(compArr.value).toMatchObject(['1', '0']);
    expect(expensiveComputation).toHaveBeenCalledTimes(2);
    //acessing the value again does not trigger another calculation
    //vue caches the return value and only calculates it again if
    //some of the dependencies change
    expect(compArr.value).toMatchObject(['1', '0']);
    expect(expensiveComputation).toHaveBeenCalledTimes(2);

    //now something that vue cares about will change
    arr[0] = 2;
    //if we try to access the value again, new calculations
    //will be triggered
    expect(compArr.value).toMatchObject(['2', '0']);
    expect(expensiveComputation).toHaveBeenCalledTimes(4);

    //pushing another value into the array also triggers
    //an update
    arr.push(3);
    expect(compArr.value).toMatchObject(['2', '0', '3']);
    expect(expensiveComputation).toHaveBeenCalledTimes(7);
  });

  test('naive memo', () => {
    const arr = reactive([1, 0]);

    //this is a spy
    const expensiveComputation = vitest.fn((x: number) => String(x));
    const expensiveMemo = memoizeWith(String, expensiveComputation);
    const compTransformation = ref<(x: number) => string>(expensiveMemo);
    const compArr = computed(() => arr.map(compTransformation.value));

    expect(compArr.value).toMatchObject(['1', '0']);
    expect(expensiveComputation).toHaveBeenCalledTimes(2);

    arr[0] = 2;
    expect(compArr.value).toMatchObject(['2', '0']);
    expect(expensiveComputation).toHaveBeenCalledTimes(3);

    arr.push(3);
    expect(compArr.value).toMatchObject(['2', '0', '3']);
    expect(expensiveComputation).toHaveBeenCalledTimes(4);

    //now I'm going to change the function
    //and just like magic all the values are going to be updated
    compTransformation.value = () => 'a';
    expect(compArr.value).toMatchObject(['a', 'a', 'a']);
  });

  test('nestedTest', () => {
    //we need to use ref because we dont want to change the array directly
    //ref provides interior mutability, a very interesting concept
    const ref1 = ref(1);
    const ref2 = ref(0);
    const arr = reactive([ref1, ref2]);

    const expensiveComputation = vitest.fn((x: number) => String(x));
    //Now compArr is a computedRef of an array of more computedRefs
    const compArr = computed(() => {
      //this line will be tracked by compArr
      return arr.map((value) => {
        //but what happens in this line will only be tracked
        //by the inner computedRef
        return computed(() => expensiveComputation(value.value));
      });
    });

    //This is a trick similar to what Promise.all does
    //I will show the code later
    const flatted = flatComputed(compArr);

    expect(flatted.value).toMatchObject(['1', '0']);
    expect(expensiveComputation).toHaveBeenCalledTimes(2);

    ref1.value = 2;
    expect(flatted.value).toMatchObject(['2', '0']);
    //previously this triggered 2 computations, now only the value
    //that was updated needs to change
    expect(expensiveComputation).toHaveBeenCalledTimes(3);

    //but push still changes the whole array
    //so it triggers a full update
    arr.push(ref(3));
    expect(flatted.value).toMatchObject(['2', '0', '3']);
    expect(expensiveComputation).toHaveBeenCalledTimes(6);
  });

  test('rxjs version', () => {
    //the same role as ref
    const sub1 = new BehaviorSubject<number>(1);
    const sub2 = new BehaviorSubject<number>(0);
    const arr = new BehaviorSubject<Observable<number>[]>([sub1, sub2]);
    const expensiveComputation = vitest.fn((x: number) => String(x));
    //Where we had ComputedRef<ComputedRef<string>>
    //now we have Observable<Observable<string>>
    const compArr = arr.pipe(
      map((arr) => {
        return arr.map((obs) => obs.pipe(map(expensiveComputation)));
      })
    );

    //This is the same role of flatComputed
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
