<template>
  <canvas ref="canvas"></canvas>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';
import { shadersTest } from './hello/shaders';
import { shaderTexture } from './hello/shaderTexture';
import { squaresTest } from './hello/Squares';
const canvas = ref<HTMLCanvasElement>();
watchEffect((clear) => {
  if (canvas.value) {
    clear(shadersTest(canvas.value, devicePixelRatio));
  }
});
</script>
