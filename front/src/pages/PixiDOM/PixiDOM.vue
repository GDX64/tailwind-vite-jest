<template>
  <!-- <pgraphics ref="graphics"></pgraphics> -->
  <GStage class="w-full h-screen">
    <template #default>
      <DOMLike></DOMLike>
    </template>
  </GStage>
</template>

<script setup lang="ts">
import GStage from '../../vueRenderer/GStage.vue';
import DOMLike from './DOMLike.vue';
</script>
