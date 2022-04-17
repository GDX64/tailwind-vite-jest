<template>
  <div ref="pixi" @click="shot"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import BattleDraw from './missile/BattleDraw';
// import { createTest } from './chart/test';
// import { start } from '../webgpu/hello';

const pixi = ref<HTMLElement>();
let battle = null as null | BattleDraw;
onMounted(() => {
  if (!pixi.value) throw Error('no pixi');
  battle = BattleDraw.start(pixi.value);
});

function shot() {
  battle?.shot();
}
</script>
