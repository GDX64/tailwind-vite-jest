<template>
  <canvas ref="canvas" width="1000" height="800" @wheel.prevent="onWheel"></canvas>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue';
import rough from 'roughjs';
import { plot } from '../rough/plotR';
import { genCandleChart } from '../rough/helpers';
const canvas = ref<HTMLCanvasElement>();

const range = ref([0, 50] as [number, number]);

function onWheel(event: WheelEvent) {
  const N = range.value[1] - range.value[0];
  if (event.ctrlKey) {
    const delta = Math.ceil(Math.sign(event.deltaY) * N * 0.05);
    const max = range.value[1] + delta;
    const min = range.value[0] - delta;
    if (max === min) return;
    range.value = [Math.max(min, 0), Math.min(max, candles.length)];
  } else {
    const delta = -Math.ceil(Math.sign(event.deltaY) * N * 0.05);
    const min = range.value[0] + delta;
    const max = range.value[1] + delta;
    if (min < 0 || max > candles.length) {
      return;
    }
    range.value = [min, max];
  }
}

const candles = genCandleChart([0, 100], 1000, 5);

watchEffect(() => {
  console.log(range.value);
  if (canvas.value) {
    const roughCanvas = rough.canvas(canvas.value);
    plot({ d: roughCanvas, canvas: canvas.value }, candles, range.value);
  }
});
</script>
