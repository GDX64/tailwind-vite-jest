<template>
  <gline :points="[from, to]"></gline>
  <gline
    :x="to[0]"
    :y="to[1]"
    :points="[
      [-6, -10],
      [0, 5],
      [6, -10],
    ]"
    :rotation="-results.angle"
  ></gline>
</template>

<script setup lang="ts">
import { vec2 } from 'gl-matrix';
import { computed } from 'vue';

const arrowDist = 10;
const props = defineProps<{ from: [number, number]; to: [number, number] }>();

const results = computed(() => {
  const diff = vec2.sub([0, 0], props.to, props.from);
  const length = vec2.len(diff);
  const angle = Math.atan2(diff[0], diff[1]);
  return { angle };
});
</script>
