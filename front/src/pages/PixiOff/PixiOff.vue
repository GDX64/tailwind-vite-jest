<template>
  <canvas ref="canvas"></canvas>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Worker from './offWorker?worker';
const canvas = ref<HTMLCanvasElement>();

onMounted(() => {
  const off = canvas.value!.transferControlToOffscreen?.()!;
  const worker = new Worker();
  worker.postMessage({ off }, [off as any]);
});
</script>
