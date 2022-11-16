<template>
  <canvas class="w-screen" ref="el"></canvas>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';
import { startSolidApp } from '../solid/Hello';
const el = ref<HTMLCanvasElement>();
watchEffect((clear) => {
  if (el.value) {
    clear(startSolidApp(el.value));
  }
});
</script>
