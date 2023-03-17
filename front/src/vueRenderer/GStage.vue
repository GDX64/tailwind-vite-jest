<template>
  <canvas ref="canvasEl" width="500" height="500"></canvas>
</template>

<script setup lang="ts">
import { ref, watch, Component } from 'vue';
import { createRoot } from './RealRenderer';
const canvasEl = ref<HTMLCanvasElement>();
const props = defineProps<{ comp: Component; props: any }>();
watch(canvasEl, (canvas, old, clear) => {
  if (canvas) {
    const destroy = createRoot(canvas, props.comp, props.props);
    clear(destroy);
  }
});
</script>
