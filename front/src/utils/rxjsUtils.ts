import {
  animationFrames,
  fromEvent,
  Observable,
  scan,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { onUnmounted, ref } from 'vue';
import { DrawData, useDrawData } from '../vueRenderer/UseDraw';
import { Ticker } from 'pixi.js';

export function useDrag(start: Observable<any>, pos = ref([0, 0] as [number, number])) {
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
