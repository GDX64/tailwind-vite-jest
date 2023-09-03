<template>
  <canvas ref="canvas" class="w-screen h-screen"></canvas>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAnimationFrames, useSize, useCanvasDPI } from '../utils/rxjsUtils';
import init, { random_world, ParticleWorld } from 'rust/pkg';
const { canvas, pixelSize } = useCanvasDPI();

let world: ParticleWorld | undefined = undefined;
init().then(() => {
  const { width, height } = pixelSize.value;
  world = random_world(width, height, 1000);
});

useAnimationFrames(() => {
  world?.evolve();
  const points = world?.points();
  const ctx = canvas.value?.getContext('2d');
  if (points && ctx) {
    console.log('drawing');
    const N = points.length / 2;
    ctx.clearRect(0, 0, pixelSize.value.width, pixelSize.value.height);
    ctx.fillStyle = 'black';
    for (let i = 0; i < N; i++) {
      const x = points[i];
      const y = points[i + N];
      ctx.fillRect(x, y, 5, 5);
    }
  }
});
</script>
