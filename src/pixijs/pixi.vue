<template>
  <div ref="pixi"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { testeo } from '../webgl2/hello';
const pixi = ref<HTMLElement>();
onMounted(() => {
  if (!pixi.value) throw Error('no pixi');
  testeo(pixi.value);
});
</script>
