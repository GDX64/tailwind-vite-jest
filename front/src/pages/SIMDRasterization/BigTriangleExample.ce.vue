<template>
  <canvas ref="canvas"></canvas>
</template>

<script setup lang="ts">
import init, { raster_triangle } from 'raytracer/pkg';
import { useCanvasDPI } from '../../utils/rxjsUtils';
import { watchEffect } from 'vue';

const { canvas, pixelSize } = useCanvasDPI();
watchEffect(async () => {
  const { height, width } = pixelSize.value;
  if (!canvas.value || !height || !width) return;
  const array = new Uint32Array(width * height);
  await init();
  const elapsed = raster_triangle(
    {
      height,
      width,
      p1: [width / 2, 0, 0],
      p2: [0, height, 0],
      p3: [width, height, 0],
    },
    array
  );
  const ctx = canvas.value.getContext('2d')!;
  const imageData = ctx.createImageData(width, height);
  imageData.data.set(new Uint8ClampedArray(array.buffer));
  ctx.putImageData(imageData, 0, 0);
  ctx.font = '32px sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText(`simd: ${elapsed.simd}`, 10, 10);
  ctx.fillText(`no simd: ${elapsed.no_simd}`, 10, 40);
  ctx.fillText(`image size: ${width}x${height} = ${width * height}px`, 10, 70);
});
</script>

<style scoped>
canvas {
  width: 100%;
  max-height: 100vh;
  aspect-ratio: 1;
}
</style>
