<template>
  <canvas ref="canvas" :width="width" :height="height" class="relative"> </canvas>
  <div class="absolute text-cyan-200 z-10 top-0 left-0">
    delta {{ regionSeen.x1 - regionSeen.x0 }} | duration: {{ duration }}
  </div>
  <div
    class="selected-area absolute bg-slate-300/20 pointer-events-none"
    :style="squareStyle"
  ></div>
</template>

<script setup lang="ts">
import { endWith, filter, fromEvent, map, switchMap, takeUntil } from 'rxjs';
import { onMounted, ref } from 'vue';
import init, { calc_set } from 'wordle';
import { drawSet as drawJs } from '../mandelbrot/mdSet';
import { Scale } from '../pixijs/chart/Scale';
const canvas = ref<HTMLCanvasElement>();
const toPixel = (x: number) => `${x}px`;
const width = 1920;
const height = 1080;
const baseX = 2;
const baseY = (baseX * height) / width;
const duration = ref(0);
const regionSeen = ref({ x0: -baseX, x1: baseX, y0: -baseY, y1: baseY });
const squareStyle = ref({
  top: toPixel(0),
  left: toPixel(0),
  height: toPixel(0),
  width: toPixel(0),
  display: 'none',
});
onMounted(async () => {
  await init();
  let scales = drawSet(canvas.value!, regionSeen.value);
  const mouseDown$ = fromEvent<MouseEvent>(canvas.value!, 'mousedown').pipe(
    filter((event) => event.button === 0)
  );
  mouseDown$
    .pipe(
      switchMap((mouseDown) => {
        return fromEvent<MouseEvent>(canvas.value!, 'mousemove').pipe(
          map((move) => {
            const left = Math.min(mouseDown.clientX, move.clientX);
            const top = Math.min(mouseDown.clientY, move.clientY);
            const width = Math.abs(mouseDown.clientX - move.clientX);
            const height = Math.abs(move.clientY - mouseDown.clientY);
            return {
              top: toPixel(top),
              left: toPixel(left),
              width: toPixel(width),
              height: toPixel(height),
              display: 'block',
            };
          }),
          filter(Boolean),
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
            if (Math.abs(mousedown.clientX - mouseUp.clientX) < 5) {
              return null;
            }
            return {
              x0: Math.min(xdown, xup),
              x1: Math.max(xdown, xup),
              y0: Math.min(ydown, yup),
              y1: Math.max(ydown, yup),
            };
          }),
          filter(Boolean)
        );
      })
    )
    .subscribe((region) => {
      regionSeen.value = region;
      scales = drawSet(canvas.value!, region);
    });
});

function drawSet(
  canvas: HTMLCanvasElement,
  region: { x0: number; y0: number; x1: number; y1: number }
) {
  if (false) {
    performance.mark('start');
    const scales = drawJs(canvas, region);
    duration.value = performance.measure('set draw', 'start').duration;
    return scales;
  }
  performance.mark('start');
  const ctx = canvas!.getContext('2d')!;
  const scaleX = new Scale(0, canvas.width, region.x0, region.x1);
  const scaleY = new Scale(canvas.height, 0, region.y0, region.y1);
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  const clamped = new Uint8ClampedArray(
    calc_set(
      width,
      height,
      new Float64Array([region.x0, region.x1, region.y0, region.y1])
    )
  );
  const imageData = new ImageData(clamped, width, height);
  ctx.putImageData(imageData, 0, 0);
  duration.value = performance.measure('set draw', 'start').duration;
  return { scaleX, scaleY };
}
</script>
