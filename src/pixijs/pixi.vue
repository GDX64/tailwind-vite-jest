<template>
  <div ref="pixi"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { shadersTest } from './shaders';
const pixi = ref<HTMLElement>();
onMounted(() => {
  if (!pixi.value) throw Error('no pixi');
  shadersTest(pixi.value);
});
</script>
