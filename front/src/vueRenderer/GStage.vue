<template>
  <canvas ref="canvasEl"></canvas>
</template>

<script setup lang="ts">
import {
  ref,
  watch,
  Component,
  reactive,
  onUnmounted,
  onMounted,
  computed,
  watchEffect,
} from 'vue';
import { createRoot } from './RealRenderer';
const canvasEl = ref<HTMLCanvasElement>();
const props = defineProps<{ comp: Component; props: any }>();

const rootApp = computed(() =>
  canvasEl.value ? createRoot(canvasEl.value, props.comp, props.props, drawData) : null
);

const drawData = reactive({
  width: 0,
  height: 0,
  isVisible: true,
});

watch(rootApp, (app, __, clear) => {
  clear(() => app?.destroy());
});

watchEffect(() => {
  if (drawData.isVisible) {
    console.log('start');
    rootApp.value?.pApp.start();
  } else {
    console.log('stop');
    rootApp.value?.pApp.stop();
  }
});

const obs = new ResizeObserver(() => {
  if (canvasEl.value) {
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
