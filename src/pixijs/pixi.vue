<template>
  <div ref="pixi"></div>
  <canvas></canvas>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
// import { createTest } from './chart/test';
import { start } from '../webgpu/hello';
const pixi = ref<HTMLElement>();
onMounted(() => {
  if (!pixi.value) throw Error('no pixi');
  start();
});
</script>
