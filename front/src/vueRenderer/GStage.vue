<template>
  <canvas ref="canvasEl"></canvas>
</template>

<script setup lang="ts">
import { ref, watch, Component } from 'vue';
import { createRoot } from './RealRenderer';
const canvasEl = ref<HTMLCanvasElement>();
const props = defineProps<{ comp: Component }>();
watch(canvasEl, (canvas, old, clear) => {
  if (canvas) {
    const destroy = createRoot(canvas, props.comp);
    clear(destroy);
  }
});
</script>
