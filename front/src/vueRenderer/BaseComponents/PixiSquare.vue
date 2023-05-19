<template>
  <pgraphics ref="g"> </pgraphics>
</template>

<script setup lang="ts">
import { Graphics } from 'pixi.js';
import { shallowRef, watchEffect } from 'vue';
import { rgen, toPixiGraphic } from './RoughInterop';
const props = defineProps<{
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
}>();
const g = shallowRef<Graphics>();

watchEffect(() => {
  if (!g.value) return;
  const data = rgen.rectangle(0, 0, props.width, props.height, {
    fill: props.fill,
    stroke: props.stroke,
    fillWeight: 2,
  });
  console.log(data);
  toPixiGraphic(data, g.value);
});
</script>
