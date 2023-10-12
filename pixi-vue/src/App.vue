<script setup lang="ts">
import { defineComponent, h, onBeforeUnmount, onMounted, ref } from "vue";
import { ElTags, createRoot } from "./renderer/renderer";
import HelloWorld from "./components/HelloWorld.vue";

const canvas = ref<HTMLCanvasElement>();

let destroy = () => {};
onMounted(async () => {
  const app = await createRoot(canvas.value!, HelloWorld);
  destroy = app.destroy;
});

onBeforeUnmount(() => {
  destroy();
});
</script>

<template>
  <div style="width: 100vw; height: 100vh; position: relative">
    <canvas
      ref="canvas"
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%"
    ></canvas>
  </div>
</template>

<style scoped></style>

