<template>
  <div ref="pixi"></div>
  <canvas></canvas>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { test } from './missile/BattleDraw';
// import { createTest } from './chart/test';
// import { start } from '../webgpu/hello';

const pixi = ref<HTMLElement>();
onMounted(() => {
  if (!pixi.value) throw Error('no pixi');
  test(pixi.value);
});
</script>
