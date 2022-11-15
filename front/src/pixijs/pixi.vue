<template>
  <canvas ref="canvas"></canvas>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';
import { graphicsPerf } from './hello/graphicsPerformance';
import { shadersTest } from './hello/shaders';
import { shaderTexture } from './hello/shaderTexture';
import { squaresTest } from './hello/Squares';
// import { setupDomTest } from './domLike/domLike';
const canvas = ref<HTMLCanvasElement>();
watchEffect((clear) => {
  if (canvas.value) {
    // clear(setupDomTest(canvas.value, devicePixelRatio));
  }
});
</script>
