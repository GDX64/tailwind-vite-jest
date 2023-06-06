<template>
  <pgraphics ref="g" />
</template>

<script setup lang="ts">
import { Graphics } from 'pixi.js';
import { shallowRef, watchEffect } from 'vue';
import { rgen, toPixiGraphic } from './RoughInterop';
import { useScaleData } from '../UseDraw';

const props = defineProps<{
  points: () => Generator<[number, number]>;
  stroke?: string;
}>();
const g = shallowRef<Graphics>();
const scaleData = useScaleData();

watchEffect(() => {
  const points = [...props.points()];
  if (!g.value || points.length < 2) return;
  const { x, y } = scaleData.scale;
  const scaledPoints = points.map(
    ([xPoint, yPoint]) => [x(xPoint), y(yPoint)] as [number, number]
  );
  g.value.clear();
  const first = scaledPoints[0];
  const N = scaledPoints.length;
  g.value.lineStyle({ color: props.stroke, width: 1 });
  g.value.moveTo(first[0], first[1]);
  for (let i = 1; i < N; i++) {
    g.value.lineTo(scaledPoints[i][0], scaledPoints[i][1]);
  }
});
</script>
