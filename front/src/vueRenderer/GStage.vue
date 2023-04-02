<template>
  <canvas ref="canvasEl"></canvas>
</template>

<script setup lang="ts">
import { ref, watch, Component, reactive, onUnmounted, onMounted } from 'vue';
import { createRoot } from './RealRenderer';
import { provideData } from './UseDraw';
const canvasEl = ref<HTMLCanvasElement>();
const props = defineProps<{ comp: Component; props: any }>();
watch(canvasEl, (canvas, old, clear) => {
  if (canvas) {
    const destroy = createRoot(canvas, props.comp, props.props, drawData);
    clear(destroy);
  }
});

const drawData = reactive({
  width: 0,
  height: 0,
});

const obs = new ResizeObserver(() => {
  if (canvasEl.value) {
    drawData.height = canvasEl.value.offsetHeight;
    drawData.width = canvasEl.value.offsetWidth;
  }
});
onMounted(() => {
  obs.observe(canvasEl.value!);
});
onUnmounted(() => {
  obs.disconnect();
});
</script>
