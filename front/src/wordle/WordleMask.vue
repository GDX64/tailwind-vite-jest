<template>
  <div class="flex">
    <div
      v-for="{ color, letter } of zipped"
      class="w-5 h-5 mr-1 mt-2 flex items-center justify-center"
      :style="{ 'background-color': color }"
    >
      {{ letter }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from '@vue/reactivity';

const props = defineProps<{ word: string; mask: number[] }>();
const zipped = computed(() => {
  return props.mask.map((value, index) => {
    return { color: colorMap(value), letter: props.word[index] };
  });
});

const colorMap = (value: number) =>
  value == 2 ? '#00ff0030' : value == 1 ? '#ffff0030' : '#55555530';
</script>
