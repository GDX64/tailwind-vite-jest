<script setup lang="ts">
import { Graphics } from "pixi.js";
import { computed } from "vue";

const props = defineProps<{
  points: { x: number; y: number }[];
}>();

const drawFn = computed(() => {
  const points = props.points;
  return (g: Graphics) => {
    const first = points.at(0);
    if (!first) return;
    g.moveTo(first.x, first.y);
    const N = points.length;
    for (let i = 1; i < N; i++) {
      const p = points[i];
      g.lineTo(p.x, p.y);
    }
    g.stroke(0xffff00);
  };
});
</script>

<template>
  <g-rect :drawfn="drawFn"></g-rect>
</template>
