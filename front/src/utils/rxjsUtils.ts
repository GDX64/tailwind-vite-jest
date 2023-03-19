import { animationFrames, fromEvent, Observable, scan, switchMap, takeUntil } from 'rxjs';
import { onUnmounted, ref } from 'vue';

export function useDrag(start: Observable<void>, pos = ref([0, 0] as [number, number])) {
  const sub = start
    .pipe(
      switchMap(() => {
        console.log('down');
        return fromEvent<PointerEvent>(window, 'pointermove').pipe(
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
  return pos;
}

export function useElapsed(time = ref(0)) {
  const sub = animationFrames().subscribe(({ elapsed }) => {
    time.value = elapsed;
  });
  onUnmounted(() => sub.unsubscribe());
  return time;
}
