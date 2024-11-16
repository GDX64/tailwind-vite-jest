<template>
  <div class="" ref="el"></div>
</template>

<script setup lang="ts">
import { startApp } from 'pixi-vue';
import { onMounted, onUnmounted, ref } from 'vue';

const el = ref<HTMLElement>();
let destroy = () => {};
onMounted(() => {
  destroy = startApp(el.value!);
});
onUnmounted(() => destroy());
</script>
