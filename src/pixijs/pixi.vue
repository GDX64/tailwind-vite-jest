<template>
  <div ref="pixi"></div>
  <button @click="test">Test</button>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { test } from './gpgpu';
const pixi = ref<HTMLElement>();
onMounted(() => {
  if (!pixi.value) throw Error('no pixi');
});
</script>
