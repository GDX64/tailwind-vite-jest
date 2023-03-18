<template>
  <gline :points="[from, to]"></gline>
</template>

<script setup lang="ts">
import { vec2 } from 'gl-matrix';
import { computed } from 'vue';

const props = defineProps<{ from: [number, number]; to: [number, number] }>();

const results = computed(() => {
  const diff = vec2.sub([0, 0], props.to, props.from);
  const length = vec2.len(diff);
  const angle = Math.atan2(diff[0], diff[1]);
  return { length, angle, diff };
});
</script>
