<template>
  <canvas ref="canvas"> </canvas>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { make } from '../webgl2/GPGPU';
const canvas = ref<HTMLCanvasElement>();

onMounted(() => {
  const gl = canvas.value!.getContext('webgl2');
  make(gl!);
});
</script>
