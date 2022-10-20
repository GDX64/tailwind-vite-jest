<template>
  <canvas ref="canvas"> </canvas>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { make } from '../webgl2/GPGPU';
import { mouseShader } from '../webgl2/shaderToy/MouseShader';
import { twglTest } from '../webgl2/shaderToy/twglTest';
const canvas = ref<HTMLCanvasElement>();

onMounted(() => {
  const gl = canvas.value!.getContext('webgl2')!;
  // mouseShader(gl, canvas.value!);
  twglTest(gl, canvas.value!);
  // make(gl!);
});
</script>
