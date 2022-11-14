<template>
  <canvas ref="canvas"></canvas>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';
import { graphicsPerf } from './hello/graphicsPerformance';
import { shadersTest } from './hello/shaders';
import { shaderTexture } from './hello/shaderTexture';
import { squaresTest } from './hello/Squares';
const canvas = ref<HTMLCanvasElement>();
watchEffect((clear) => {
  if (canvas.value) {
    clear(graphicsPerf(canvas.value, devicePixelRatio));
  }
});
</script>
