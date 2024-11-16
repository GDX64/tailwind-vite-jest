<template>
  <div
    class="bg-slate-600 flex justify-around items-end rounded-sm"
    :style="{ height: `${size}px`, width: `${size}px` }"
  >
    <template v-for="item of list" :key="item.label">
      <HistogramBarVue
        :bucket="item"
        :bars-width="barsWidth"
        :height-factor="heightFactor"
      ></HistogramBarVue>
    </template>
  </div>
</template>

<script lang="ts" setup>
import HistogramBarVue from './HistogramBar.vue';
import { computed } from 'vue';
import { Bucket } from '../domain/histogramGen';

const size = 500;
const props = defineProps<{ list: Bucket[]; maxCount: number }>();
const barsWidth = computed(() => size / props.list.length - 2);
const heightFactor = computed(() => size / props.maxCount);
</script>
