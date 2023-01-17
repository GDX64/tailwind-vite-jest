<template>
  <canvas ref="canvas"></canvas>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';
import { graphicsPerf } from './hello/graphicsPerformance';
import { shadersTest } from './hello/shaders';
import { shaderTexture } from './hello/shaderTexture';
import { squaresTest } from './hello/Squares';
import { setupDomTest } from './domLike/domLike';
import { createChart } from './chartv2/ChartV2';
import { start } from '../webgpu/hello';
const canvas = ref<HTMLCanvasElement>();
watchEffect((clear) => {
  if (canvas.value) {
    // clear(createChart(canvas.value, devicePixelRatio));
    start(canvas.value.getContext('2d')!);
  }
});
</script>
