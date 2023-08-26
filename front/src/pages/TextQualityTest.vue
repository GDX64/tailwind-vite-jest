<template>
  <div class="w-screen h-screen flex flex-col">
    <div class="select-none">text: {{ amountOfText }} // Fps: {{ fps }}</div>
    <select v-model="textOptions" class="w-fit bg-gray-400">
      <option :value="TextOptions.randomNums">Random</option>
      <option :value="TextOptions.recicle">Recicle</option>
    </select>
    <canvas ref="canvas" class="grow" @click="amountOfText += 500"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCanvasDPI, useAnimationFrames } from '../utils/rxjsUtils';
enum TextOptions {
  randomNums,
  recicle,
}

const textOptions = ref(TextOptions.randomNums);
const { canvas, pixelSize } = useCanvasDPI();
const amountOfText = ref(500);
const fps = ref(0);
const recicleValues = [
  0.123456, 0.234567, 0.345678, 0.456789, 0.56789, 0.678901, 0.789012, 0.890123, 0.901234,
  0.012345,
];

useAnimationFrames(({ delta, count, elapsed }) => {
  if (count % 60 === 0) {
    fps.value = Math.round(1000 / delta);
  }
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) return;
  const { height, width } = pixelSize.value;
  ctx.clearRect(0, 0, width, height);
  ctx.font = '20px sans-serif';
  ctx.textBaseline = 'top';
  for (let i = 0; i < amountOfText.value; i++) {
    const baseWidth = 100;
    const x = (i * baseWidth) % width;
    const y = (Math.floor((i * baseWidth) / width) * 20) % height;
    if (textOptions.value === TextOptions.randomNums) {
      ctx.fillText(Math.random().toFixed(6), x, y);
    } else if (textOptions.value === TextOptions.recicle) {
      ctx.fillText(recicleValues[(i + count) % recicleValues.length].toFixed(6), x, y);
    }
  }
});
</script>
