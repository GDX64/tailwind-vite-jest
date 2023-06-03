<template>
  <canvas ref="canvasEl"></canvas>
</template>

<script setup lang="ts">
import {
  ref,
  shallowRef,
  onUnmounted,
  onMounted,
  watchEffect,
  useSlots,
  PropType,
} from 'vue';
import { createRoot } from './PIXIRender';
import { DrawData, createDrawData } from './UseDraw';
import * as PIXI from 'pixi.js';

const canvasEl = ref<HTMLCanvasElement>();
const slots = useSlots();
const rootApp = shallowRef(makeApp());
onMounted(() => {
  rootApp.value = makeApp();
});
onUnmounted(() => rootApp.value?.destroy());

const props = defineProps({
  drawData: { type: Object as PropType<DrawData>, default: () => createDrawData() },
});

function makeApp() {
  return canvasEl.value
    ? createRoot(canvasEl.value, slots.default!, props.drawData, PIXI)
    : null;
}

const drawData = props.drawData;

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
