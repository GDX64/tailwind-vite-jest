<template>
  <pgraphics ref="g" />
</template>

<script setup lang="ts">
import { Graphics } from 'pixi.js';
import { shallowRef, watchEffect } from 'vue';
import { rgen, toPixiGraphic } from './RoughInterop';
import { ScaleXY } from '../interfaces';
import { useScaleData } from '../UseDraw';
const props = defineProps<{
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  stroke?: string;
  useScale?: boolean;
  opacity?: number;
}>();
const g = shallowRef<Graphics>();
const scale = useScaleData();
watchEffect(() => {
  if (!g.value) return;
  const { x, y } = props.useScale
    ? scale.scale
    : { x: (x: number) => x, y: (y: number) => y };
  const { x0, x1, y0, y1 } = props;
  const data = rgen.line(x(x0), y(y0), x(x1), y(y1), {
    stroke: props.stroke,
  });
  g.value.clear();
  g.value.alpha = props.opacity ?? 1;
  toPixiGraphic(data, g.value);
});
</script>
