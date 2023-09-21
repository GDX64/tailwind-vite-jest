<template>
  <div class="w-screen h-screen relative">
    <canvas ref="canvas" class="w-full h-full absolute top-0"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watchEffect } from 'vue';
import { Application, Container, Text, BitmapFontManager } from 'pixi.js';
import { useAnimationFrames, useSize } from '../../utils/rxjsUtils';

const canvas = ref<HTMLCanvasElement | null>(null);
const { size } = useSize(canvas);
let app: Application | null = null;

onMounted(async () => {
  if (!canvas.value) {
    return;
  }
  app = new Application();
  await app.init({
    element: canvas.value as any,
    backgroundColor: 0xffffaa,
    resizeTo: canvas.value,
    preference: 'webgpu',
  });
});

onUnmounted(() => (app?.stop(), app?.renderer.destroy()));
</script>
