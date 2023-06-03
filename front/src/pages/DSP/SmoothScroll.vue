<template>
  <GStage class="w-full aspect-square">
    <template #default>
      <SmoothScrollCharts />
    </template>
  </GStage>
</template>

<script setup lang="ts">
import GStage from '../../vueRenderer/GStage.vue';
import SmoothScrollCharts from './SmoothScrollCharts.vue';
</script>
