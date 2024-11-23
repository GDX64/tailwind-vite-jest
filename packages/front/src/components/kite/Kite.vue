<template>
  <canvas ref="canvas" class="w-full h-full min-h-screen"></canvas>
</template>

<script lang="ts" setup>
import { vec3 } from 'gl-matrix';
import { useAnimationFrames, useCanvasDPI } from '../../utils/rxjsUtils';
import { Camera, KiteDraw } from './HandDraw';

const { canvas, pixelSize } = useCanvasDPI();
const kite1 = new KiteDraw([-2, 0, 0]);

useAnimationFrames(({ elapsed }) => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx || !pixelSize.value.width || !pixelSize.value.height) return;

  ctx.clearRect(0, 0, pixelSize.value.width, pixelSize.value.height);
  kite1.vertex.rotateY((1 / 50) * 0.93);
  const x = Math.sin(elapsed / 1000);
  const y = Math.sin((1.1 * elapsed) / 1000);
  kite1.vertex.setPosition(vec3.fromValues(x, y, 0));
  // kite1.vertex.rotateX(-Math.PI / 10);
  const camera = new Camera([pixelSize.value.width, pixelSize.value.height]);
  camera.update();
  kite1.evolve(0.016);
  kite1.draw(ctx, camera);
});
</script>
