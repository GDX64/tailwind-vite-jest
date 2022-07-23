<template>
  <canvas ref="canvas" width="1000" height="800"></canvas>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import rough from 'roughjs';
import { plot } from '../rough/plotR';
import { genCandleChart } from '../rough/helpers';
const canvas = ref<HTMLCanvasElement>();
onMounted(() => {
  if (canvas.value) {
    const roughCanvas = rough.canvas(canvas.value);
    const candles = genCandleChart([0, 100], 50, 5);
    plot({ d: roughCanvas, canvas: canvas.value }, candles, [5, 40]);
  }
});
</script>
