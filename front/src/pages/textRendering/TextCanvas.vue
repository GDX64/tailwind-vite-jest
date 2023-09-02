<template>
  <canvas ref="canvas" class="grow"></canvas>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAnimationFrames, useCanvasDPI } from '../../utils/rxjsUtils';

const props = defineProps<{
  amountOfText: number;
}>();
const { canvas, pixelSize } = useCanvasDPI();
const fps = ref(0);

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
  for (let i = 0; i < props.amountOfText; i++) {
    const baseWidth = 100;
    const x = (i * baseWidth) % width;
    const y = (Math.floor((i * baseWidth) / width) * 20) % height;
    ctx.fillText(Math.random().toFixed(6), x, y);
  }
});
</script>
