<template>
  <div ref="pixi"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { startTest } from './dragTest';
const pixi = ref<HTMLElement>();
onMounted(() => {
  if (!pixi.value) throw Error('no pixi');
  startTest(pixi.value);
});
</script>
