import { computed, signal, root, onDispose } from '@maverick-js/signals';

describe('testing marverick signals', () => {
  test('computed test', () => {
    root((finilize) => {
      const s1 = signal(0);
      const compRun = vitest.fn();
      const dispose = vitest.fn();
      const comp = computed(() => {
        compRun();
        onDispose(dispose);
        return s1();
      });
      expect(compRun).toBeCalledTimes(0);
      comp();
      expect(compRun).toBeCalledTimes(1);
      s1.set(10);
      expect(compRun).toBeCalledTimes(1);
      expect(comp()).toBe(10);
      expect(compRun).toBeCalledTimes(2);
      expect(dispose).toBeCalledTimes(1);
      finilize();
      expect(dispose).toBeCalledTimes(2);
    });
  });
});
