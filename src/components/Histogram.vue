<template>
  <div
    class="bg-slate-600 flex justify-around items-end rounded-sm"
    :style="{ height: `${size}px`, width: `${size}px` }"
  >
    <div
      :class="`bg-purple-400 rounded-sm transition-all duration-75 text-center 
      hover:brightness-110`"
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

const size = 500;
const props = defineProps<{ list: Bucket[] }>();
const barsWidth = computed(() => size / props.list.length - 2);
const heightFactor = computed(
  () => size / Math.max(...props.list.map((item) => item.count))
);
</script>
