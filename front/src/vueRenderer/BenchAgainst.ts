import { ref, computed } from 'vue';
import { Computed, Signal } from './SuperReactive';

const N = 1000;

function benchVue() {
  const s1 = ref(0);
  const s2 = ref(1);
  const c = computed(() => s1.value + s2.value);

  for (let i = 0; i < N; i++) {
    s1.value = Math.random();
    s2.value = Math.random();
    c.value;
    c.value;
  }
}
function benchMine() {
  const s1 = new Signal(0);
  const s2 = new Signal(0);
  const c = new Computed(() => s1.value + s2.value);

  for (let i = 0; i < N; i++) {
    s1.write(Math.random());
    s2.write(Math.random());
    c.read();
    c.read();
  }
}

export function bench() {
  for (let i = 0; i < 1000; i++) {
    benchMine();
    // benchVue();
  }
}
