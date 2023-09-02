<template>
  <canvas ref="canvas" class="grow"></canvas>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { Application, Container, Text, BitmapFontManager } from 'pixi.js';
import { useAnimationFrames, useCanvasDPI } from '../../utils/rxjsUtils';

const props = defineProps<{
  amountOfText: number;
}>();
BitmapFontManager.install('myFont', { fontSize: 50, fill: 'red' });
const canvas = ref<HTMLCanvasElement | null>(null);

watchEffect(async (clear) => {
  if (!canvas.value) {
    return;
  }
  const c = new Container();
  const textArr = [...new Array(10)].map(() => {
    const text = new Text({
      text: 'hello',
      renderMode: 'bitmap',
    });
    text.tint = 0xff0000;
    text.x = Math.random() * 700;
    text.y = Math.random() * 600;
    c.addChild(text);
    return text;
  });
  const app = new Application();
  await app.init({
    element: canvas.value as any,
    backgroundColor: 0xffffff,
    resizeTo: canvas.value,
  });
  app.stage.addChild(c);
  app.ticker.add(() => {
    textArr.forEach((text) => {
      text.text = Math.random().toFixed(6);
    });
  });
});
</script>
