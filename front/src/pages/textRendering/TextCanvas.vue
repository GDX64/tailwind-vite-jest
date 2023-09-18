<template>
  <canvas ref="canvas" class="grow"></canvas>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAnimationFrames, useCanvasDPI } from '../../utils/rxjsUtils';

const props = defineProps<{
  amountOfText: number;
}>();
const { canvas, pixelSize } = useCanvasDPI();
const fps = ref(0);
const texts = computed(() =>
  [...new Array(props.amountOfText)].map(() => ({
    x: Math.random() * pixelSize.value.width,
    y: Math.random() * pixelSize.value.height,
    text: Math.random().toFixed(6),
  }))
);

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
  texts.value.slice(0, 10).forEach((text) => {
    text.text = Math.random().toFixed(6);
  });
  texts.value.forEach((text) => {
    ctx.fillText(text.text, text.x, text.y);
  });
});
</script>
