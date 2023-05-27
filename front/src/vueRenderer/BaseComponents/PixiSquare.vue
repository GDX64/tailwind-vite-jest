<template>
  <pgraphics ref="g">
    <slot></slot>
  </pgraphics>
</template>

<script setup lang="ts">
import { Graphics } from 'pixi.js';
import { shallowRef, watchEffect } from 'vue';
import { rgen, toPixiGraphic } from './RoughInterop';
import { useDrawData } from '../UseDraw';
const props = defineProps<{
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
}>();
const g = shallowRef<Graphics>();

const drawData = useDrawData();

watchEffect(() => {
  if (!g.value) return;
  if (!drawData.roughness) {
    g.value.clear();
    g.value.lineStyle(1, props.stroke);
    g.value.drawRect(0, 0, props.width, props.height);
    return;
  }
  const data = rgen.rectangle(0, 0, props.width, props.height, {
    fill: props.fill,
    stroke: props.stroke,
    fillWeight: 2,
    roughness: drawData.roughness,
  });
  g.value.clear();
  toPixiGraphic(data, g.value);
});
</script>
