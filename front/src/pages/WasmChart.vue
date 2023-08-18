<template>
  <div class="place-to-mount-the-chart w-full"></div>
</template>

<script setup lang="ts">
import init, { leptos_main } from 'incremental_draw/pkg/incremental_draw';
import { onUnmounted } from 'vue';

let disposeFn = () => {};
onUnmounted(() => {
  console.log('unmounting');
  disposeFn();
});

init().then(() => {
  console.log('initialized');
  disposeFn = leptos_main('.place-to-mount-the-chart');
});
</script>
