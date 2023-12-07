<template>
  <canvas ref="canvas" class="w-screen h-screen"></canvas>
</template>

<script setup lang="ts">
import init, { raster_triangle } from 'raytracer/pkg';
import { useCanvasDPI } from '../utils/rxjsUtils';
import { onMounted } from 'vue';
const { canvas, pixelSize, size } = useCanvasDPI();
onMounted(async () => {
  await init();
  const { height, width } = pixelSize.value;
  const array = new Uint32Array(width * height);
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
  const ctx = canvas.value!.getContext('2d')!;
  const imageData = ctx.createImageData(width, height);
  imageData.data.set(new Uint8ClampedArray(array.buffer));
  ctx.putImageData(imageData, 0, 0);
  ctx.font = '32px serif';
  ctx.textBaseline = 'top';
  ctx.fillText(`simd: ${elapsed.simd}ms, no simd: ${elapsed.no_simd}ms`, 10, 10);
});
init().then(() => {});
</script>
