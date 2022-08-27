<template>
  <button @click="">draw</button>
  <div class="">delta {{ regionSeen.x1 - regionSeen.x0 }}</div>
  <canvas ref="canvas" width="1000" height="1000" class="relative"> </canvas>
  <div class="selected-area absolute bg-slate-400/20" :style="squareStyle"></div>
</template>

<script setup lang="ts">
import { endWith, fromEvent, map, Subject, switchMap, takeUntil } from 'rxjs';
import { onMounted, ref, watchEffect } from 'vue';
import { drawSet } from '../mandelbrot/mdSet';
const canvas = ref<HTMLCanvasElement>();
const toPixel = (x: number) => `${x}px`;
const regionSeen = ref({ x0: -2, x1: 2, y0: -2, y1: 2 });
const squareStyle = ref({
  top: toPixel(0),
  left: toPixel(0),
  height: toPixel(0),
  width: toPixel(0),
  display: 'none',
});
onMounted(() => {
  let scales = drawSet(canvas.value!, regionSeen.value);
  const mouseDown$ = fromEvent<MouseEvent>(canvas.value!, 'mousedown');
  mouseDown$
    .pipe(
      switchMap((mouseDown) => {
        return fromEvent<MouseEvent>(canvas.value!, 'mousemove').pipe(
          map((move) => {
            return {
              top: toPixel(mouseDown.clientY),
              left: toPixel(mouseDown.clientX),
              width: toPixel(Math.abs(mouseDown.clientX - move.clientX)),
              height: toPixel(Math.abs(move.clientY - mouseDown.clientY)),
              display: 'block',
            };
          }),
          takeUntil(fromEvent(window, 'mouseup')),
          endWith({
            top: toPixel(0),
            left: toPixel(0),
            width: toPixel(0),
            height: toPixel(0),
            display: 'none',
          })
        );
      })
    )
    .subscribe((region) => {
      console.log(region);
      squareStyle.value = region;
    });
  mouseDown$
    .pipe(
      switchMap((mousedown) => {
        return fromEvent<MouseEvent>(canvas.value!, 'mouseup').pipe(
          map((mouseUp) => {
            const xdown = scales.scaleX.transform(mousedown.clientX);
            const xup = scales.scaleX.transform(mouseUp.clientX);
            const ydown = scales.scaleY.transform(mousedown.clientY);
            const yup = scales.scaleY.transform(mouseUp.clientY);
            return {
              x0: Math.min(xdown, xup),
              x1: Math.max(xdown, xup),
              y0: Math.min(ydown, yup),
              y1: Math.max(ydown, yup),
            };
          })
        );
      })
    )
    .subscribe((region) => {
      regionSeen.value = region;
      scales = drawSet(canvas.value!, region);
    });
});
</script>
