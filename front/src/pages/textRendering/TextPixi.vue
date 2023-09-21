<template>
  <canvas ref="canvas" class="grow"></canvas>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watchEffect } from 'vue';
import { Application, Container, Text, BitmapFontManager } from 'pixi.js';
import { useAnimationFrames, useSize } from '../../utils/rxjsUtils';

const props = defineProps<{
  amountOfText: number;
}>();
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
    backgroundColor: 0xffffff,
    resizeTo: canvas.value,
    preference: 'webgpu',
  });
  const c = new Container();
  const textArr = [...new Array(props.amountOfText)].map(() => {
    const text = new Text({
      text: Math.random().toFixed(6),
      renderMode: 'bitmap',
      style: { fontSize: 13 },
    });
    text.tint = 0xff0000;
    text.x = Math.random() * size.width;
    text.y = Math.random() * size.height;
    c.addChild(text);
    return text;
  });
  app.stage.addChild(c);
  app.ticker.add(() => {
    textArr.slice(0, 10).forEach((text) => {
      text.text = Math.random().toFixed(6);
    });
  });
});

onUnmounted(() => (app?.stop(), app?.renderer.destroy()));
</script>
