import {
  animationFrames,
  fromEvent,
  Observable,
  pairwise,
  scan,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { computed, onUnmounted, reactive, ref, watchEffect } from 'vue';
import { DrawData, useDrawData } from '../vueRenderer/UseDraw';
import { Ticker } from 'pixi.js';

export function useDrag(start: Observable<any>) {
  const pos = ref([0, 0] as [number, number]);
  const isDragging = ref(false);
  const sub = start
    .pipe(
      switchMap(() => {
        return fromEvent<PointerEvent>(window, 'pointermove').pipe(
          tap({
            subscribe() {
              isDragging.value = true;
            },
            finalize() {
              isDragging.value = false;
            },
          }),
          scan(
            (acc, value) =>
              [acc[0] + value.movementX, acc[1] + value.movementY] as [number, number],
            pos.value
          ),
          takeUntil(fromEvent(window, 'pointerup'))
        );
      })
    )
    .subscribe((value) => {
      pos.value = value;
    });
  onUnmounted(() => sub.unsubscribe());
  return { pos, isDragging };
}

export function useElapsed(time = ref(0)) {
  const data = useDrawData();
  const sub = animationFrames().subscribe(({ elapsed }) => {
    if (data.isVisible) {
      time.value = elapsed;
    }
  });
  onUnmounted(() => sub.unsubscribe());
  return time;
}

export function useAnimation(fn: (ticker: Ticker) => void, drawData?: DrawData) {
  const data = drawData ?? useDrawData();
  const ticker = data.app?.ticker;
  if (ticker) {
    const cb = () => fn(ticker as Ticker);
    ticker.add(cb);
    onUnmounted(() => ticker.remove(cb));
  }
}

export function useAnimationFrames(
  fn: (args: { elapsed: number; delta: number; count: number }) => void
) {
  let last = 0;
  let count = 0;
  const sub = animationFrames().subscribe(({ elapsed }) => {
    const delta = elapsed - last;
    last = elapsed;
    count++;
    fn({ elapsed, delta, count });
  });
  onUnmounted(() => sub.unsubscribe());
}

export function useInterval(fn: () => void, time: number) {
  const timer = setInterval(fn, time);
  onUnmounted(() => clearInterval(timer));
}

export function storageRef(name: string, initial = '') {
  const value = ref('');
  value.value = localStorage.getItem(name) ?? initial;
  watchEffect(() => {
    localStorage.setItem(name, value.value);
  });
  return value;
}

export function useSize(container = ref<HTMLElement>()) {
  const size = reactive({ width: 0, height: 0 });
  const obs = new ResizeObserver((entries) => {
    const el = container.value;
    size.width = el?.clientWidth ?? 0;
    size.height = el?.clientHeight ?? 0;
  });
  watchEffect((clear) => {
    const el = container.value;
    if (el) {
      obs.observe(el);
      clear(() => obs.unobserve(el));
    }
  });
  onUnmounted(() => obs.disconnect());
  return { size, container };
}

export function useCanvasDPI() {
  const canvas = ref<HTMLCanvasElement>();
  const { size } = useSize(canvas);
  watchEffect(() => {
    if (canvas.value) {
      const ctx = canvas.value.getContext('2d');
      if (ctx) {
        const dpr = self.devicePixelRatio || 1;
        const { width, height } = size;
        canvas.value.width = width * dpr;
        canvas.value.height = height * dpr;
      }
    }
  });
  return {
    canvas,
    size,
    pixelSize: computed(() => {
      return {
        width: size.width * (self.devicePixelRatio || 1),
        height: size.height * (self.devicePixelRatio || 1),
      };
    }),
  };
}
