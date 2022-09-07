import { computed, ref } from 'vue';
import { CompRef, Computation } from '../MyVue';
function myBench(name: string, fn: () => void) {
  const begin = performance.now();
  for (let i = 0; i < 100; i++) {
    fn();
  }
  console.log(name, performance.now() - begin);
}

const N = 1000;

function testVue() {
  const ref1 = ref(0);
  const ref2 = ref(0);
  const comp = computed(() => ref1.value + ref2.value);
  for (let i = 0; i < N; i++) {
    comp.value;
    ref1.value = i;
    comp.value;
    ref2.value = i;
    comp.value;
  }
}

function testMyVue() {
  const comp1 = new CompRef(0);
  const comp2 = new CompRef(0);
  const comp = new Computation((ctx) => comp1.track(ctx) + comp2.track(ctx));
  for (let i = 0; i < N; i++) {
    comp.get();
    comp1.set(i);
    comp.get();
    comp2.set(i);
    comp.get();
  }
}

myBench('vue', testVue);
myBench('mine', testMyVue);
