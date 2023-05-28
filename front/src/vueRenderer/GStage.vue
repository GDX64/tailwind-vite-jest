<template>
  <canvas ref="canvasEl"></canvas>
</template>

<script setup lang="ts">
import {
  ref,
  watch,
  reactive,
  onUnmounted,
  onMounted,
  computed,
  watchEffect,
  useSlots,
} from 'vue';
import { createRoot } from './PIXIRender';
import { createDrawData } from './UseDraw';
import PixiSquare from './BaseComponents/PixiSquare.vue';

const canvasEl = ref<HTMLCanvasElement>();
const slots = useSlots();
const rootApp = computed(() =>
  canvasEl.value ? createRoot(canvasEl.value, slots.default!, drawData) : null
);

const drawData = reactive(createDrawData());

defineExpose({ drawData });

watch(rootApp, (app, __, clear) => {
  clear(() => app?.destroy());
});

watchEffect(() => {
  if (drawData.isVisible) {
    rootApp.value?.pApp.start();
  } else {
    rootApp.value?.pApp.stop();
  }
});

const obs = new ResizeObserver(() => {
  if (canvasEl.value) {
    drawData.realWidth = canvasEl.value.width;
    drawData.realHeight = canvasEl.value.height;
    drawData.height = canvasEl.value.offsetHeight;
    drawData.width = canvasEl.value.offsetWidth;
  }
});

const intersect = new IntersectionObserver((entries) => {
  entries.forEach((entry) => (drawData.isVisible = entry.isIntersecting));
});

onMounted(() => {
  intersect.observe(canvasEl.value!);
  obs.observe(canvasEl.value!);
});

onUnmounted(() => {
  obs.disconnect();
  intersect.disconnect();
});
</script>
