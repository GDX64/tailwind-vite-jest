<template>
  <div class="w-[500px] h-[500px] bg-slate-600 flex justify-around items-end rounded-sm">
    <div
      class="bg-purple-400 rounded-sm transition-all"
      v-for="item of list"
      :style="{
        height: `${item.count * heightFactor}px`,
        width: `${barsWidth}px`,
      }"
    >
      {{ item.label }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Bucket } from '../domain/histogramGen';

const props = defineProps<{ list: Bucket[] }>();
const barsWidth = computed(() => 500 / props.list.length - 3);
const heightFactor = computed(
  () => 500 / Math.max(...props.list.map((item) => item.count))
);
</script>
