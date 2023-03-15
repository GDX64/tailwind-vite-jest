<template>
  <canvas ref="canvasRef" width="500" height="500"></canvas>
  <slot></slot>
</template>

<script setup lang="ts">
import { ref, watchEffect, reactive, provide } from 'vue';
import { ChartType, renderRough, Stage, GroupNode } from './CartesianCharts';
const canvasRef = ref<HTMLCanvasElement>();
const root: GroupNode = reactive({
  type: ChartType.GROUP,
  children: [],
  data: { matrix: new DOMMatrix() },
});

provide('parentNode', root);

watchEffect(() => {
  if (!canvasRef.value) return;
  const stage: Stage = {
    canvas: canvasRef.value,
    root,
  };
  console.log(stage);
  renderRough(stage);
});
</script>
