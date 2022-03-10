<template>
  <div ref="pixi"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
// import { testeo } from '../webgl2/hello';
// import { main } from '../webgl2/varyings';
// import { shadersTest } from './shaders';
import { createTest } from './chart/Chart';
const pixi = ref<HTMLElement>();
onMounted(() => {
  if (!pixi.value) throw Error('no pixi');
  createTest(pixi.value);
});
</script>
