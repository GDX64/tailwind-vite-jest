import { suite, add, complete, cycle, save } from 'benny';
import { computed, ref } from 'vue';
import { combineSignals, Signal } from '../Signal';
import { Stream } from '../Stream';
import { CompRef, Computation } from '../MyVue';
function testSignal() {
  const stream1 = new Stream<number>();
  const stream2 = new Stream<number>();
  const signal1 = Signal.fromStream(stream1, 0);
  const signal2 = Signal.fromStream(stream2, 0);
  const mapped = combineSignals((x: number, y: number) => x + y, signal1, signal2);
  mapped.getValue();
  stream1.next(5);
  mapped.getValue();
  stream2.next(5);
  mapped.getValue();
}

function testVue() {
  const ref1 = ref(0);
  const ref2 = ref(0);
  const comp = computed(() => ref1.value + ref2.value);
  comp.value;
  ref1.value = 5;
  comp.value;
  ref2.value = 5;
  comp.value;
}

function testMyVue() {
  const comp1 = new CompRef(0);
  const comp2 = new CompRef(0);
  const comp = new Computation((ctx) => comp1.track(ctx) + comp2.track(ctx));
  comp.get();
  comp1.set(5);
  comp.get();
  comp2.set(5);
  comp.get();
}

suite(
  'Example',
  add('vue', testVue),
  add('myVue', testMyVue),
  cycle(),
  complete(),
  save({ file: 'reduce', format: 'chart.html' })
);
