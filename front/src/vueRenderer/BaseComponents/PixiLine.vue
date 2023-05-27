<template>
  <pgraphics ref="g"> </pgraphics>
</template>

<script setup lang="ts">
import { Graphics } from 'pixi.js';
import { shallowRef, watchEffect } from 'vue';
import { rgen, toPixiGraphic } from './RoughInterop';
const props = defineProps<{
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  stroke?: string;
}>();
const g = shallowRef<Graphics>();

watchEffect(() => {
  if (!g.value) return;
  const { x0, x1, y0, y1 } = props;
  const data = rgen.line(x0, y0, x1, y1, {
    stroke: props.stroke,
  });
  g.value.clear();
  toPixiGraphic(data, g.value);
});
</script>
