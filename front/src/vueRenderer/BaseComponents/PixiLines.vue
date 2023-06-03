<template>
  <pgraphics ref="g" />
</template>

<script setup lang="ts">
import { Graphics } from 'pixi.js';
import { shallowRef, watchEffect } from 'vue';
import { rgen, toPixiGraphic } from './RoughInterop';
import { useScaleData } from '../UseDraw';
const props = defineProps<{
  points: [number, number][];
  stroke?: string;
}>();
const g = shallowRef<Graphics>();
const scaleData = useScaleData();

watchEffect(() => {
  if (!g.value || props.points.length < 2) return;
  const { x, y } = scaleData.scale;
  const scaledPoints = props.points.map(
    ([xPoint, yPoint]) => [x(xPoint), y(yPoint)] as [number, number]
  );
  const data = rgen.curve(scaledPoints, {
    stroke: props.stroke,
  });
  g.value.clear();
  toPixiGraphic(data, g.value);
});
</script>
