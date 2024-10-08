import {
  animationFrames,
  fromEvent,
  map,
  Observable,
  pairwise,
  scan,
  skip,
  Subject,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
} from 'rxjs';
import {
  computed,
  onUnmounted,
  reactive,
  Ref,
  ref,
  shallowRef,
  watch,
  watchEffect,
  watchSyncEffect,
} from 'vue';

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

export function useVisibility(container: Ref<HTMLElement | null | undefined>) {
  const isVisible = ref(false);
  const observer = new IntersectionObserver((entries) => {
    isVisible.value = entries.at(-1)?.isIntersecting ?? false;
  });

  watch(
    container,
    (el, _, clear) => {
      if (el) {
        observer.observe(el);
        clear(() => {
          observer.unobserve(el);
        });
      }
    },
    {
      immediate: true,
    }
  );

  return { isVisible };
}

export function useSize(container = ref<HTMLElement | null>()) {
  const size = reactive({ width: 0, height: 0 });
  const obs = new ResizeObserver((entries) => {
    const el = container.value;
    size.width = el?.offsetWidth ?? 0;
    size.height = el?.offsetHeight ?? 0;
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
  watchSyncEffect(() => {
    if (canvas.value) {
      const ctx = canvas.value.getContext('2d');
      if (ctx) {
        const dpr = self.devicePixelRatio || 1;
        const { width, height } = size;
        canvas.value.width = Math.floor(width * dpr);
        canvas.value.height = Math.floor(height * dpr);
      }
    }
  });
  return {
    canvas,
    size,
    pixelSize: computed(() => {
      return {
        width: Math.floor(size.width * (self.devicePixelRatio || 1)),
        height: Math.floor(size.height * (self.devicePixelRatio || 1)),
      };
    }),
  };
}

export function animationProgress(duration: number) {
  return animationFrames().pipe(
    map(({ elapsed }) => Math.min(elapsed / duration, 1)),
    takeWhile((v) => v <= 1, true)
  );
}

export function lerpTime(a: number, b: number, t: number) {
  return a * (1 - t) + b * t;
}

export function useInterpolation<T>(
  r: () => T,
  duration: number,
  interpolator: (initial: T, final: T, t: number) => T
) {
  const subject = new Subject<T>();
  watchEffect(() => {
    subject.next(r());
  });
  const sRef = shallowRef(r());
  const sub = subject
    .pipe(
      skip(1),
      switchMap((v) => {
        return animationProgress(duration).pipe(
          map((t) => interpolator(sRef.value, v, t))
        );
      })
    )
    .subscribe((final) => {
      sRef.value = final;
    });
  onUnmounted(() => sub.unsubscribe());
  return sRef;
}
