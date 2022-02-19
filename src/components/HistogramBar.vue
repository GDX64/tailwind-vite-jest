<template>
  <div
    :class="`bg-purple-400 rounded-sm transition-all duration-75 text-center 
      hover:brightness-110`"
    :style="{
      height: `${bucket.count * heightFactor}px`,
      width: `${barsWidth}px`,
    }"
  >
    {{ bucket.label }}
  </div>
</template>

<script lang="ts" setup>
import { Bucket } from '../domain/histogramGen';
defineProps<{ bucket: Bucket; barsWidth: number; heightFactor: number }>();
</script>
