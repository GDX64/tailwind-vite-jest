<template>
  <div ref="pixi"></div>
  <!-- <CompareTable></CompareTable> -->
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { tableTest } from './pixiTable';
import CompareTable from './CompareTable.vue';
const pixi = ref<HTMLElement>();
// onMounted(() => {
//   if (!pixi.value) throw Error('no pixi');
//   tableTest(pixi.value);
// });
</script>
