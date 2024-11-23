<template>
  <canvas ref="canvas" class="w-full h-full min-h-screen"></canvas>
</template>

<script lang="ts" setup>
import { useAnimationFrames, useCanvasDPI } from '../../utils/rxjsUtils';
import { Camera, KiteDraw } from './HandDraw';

const { canvas, pixelSize } = useCanvasDPI();
const kite1 = new KiteDraw([-2, 0, 0]);

useAnimationFrames(() => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx || !pixelSize.value.width || !pixelSize.value.height) return;

  ctx.clearRect(0, 0, pixelSize.value.width, pixelSize.value.height);
  kiteDraw(ctx);
});

function kiteDraw(ctx: CanvasRenderingContext2D) {
  kite1.vertex.rotateY(1 / 50);
  // kite1.vertex.rotateX(-Math.PI / 10);
  const camera = new Camera([pixelSize.value.width, pixelSize.value.height]);
  camera.update();
  kite1.evolve(0.016);
  kite1.draw(ctx, camera);
}
</script>
