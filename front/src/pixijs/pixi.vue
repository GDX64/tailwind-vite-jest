<template>
  <canvas ref="canvas" width="800" height="800"></canvas>
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
import { webgpuTriangle } from '../webgpu/triangle';
const canvas = ref<HTMLCanvasElement>();
watchEffect((clear) => {
  if (canvas.value) {
    // clear(createChart(canvas.value, devicePixelRatio));
    // start(canvas.value.getContext('2d')!);
    clear(webgpuTriangle(canvas.value));
  }
});
</script>
