<template>
  <canvas ref="canvas" width="1000" height="800"></canvas>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import rough from 'roughjs';
import { plot } from '../rough/plotR';
const canvas = ref<HTMLCanvasElement>();
onMounted(() => {
  if (canvas.value) {
    const roughCanvas = rough.canvas(canvas.value);
    plot(roughCanvas, canvas.value);
  }
});
</script>
