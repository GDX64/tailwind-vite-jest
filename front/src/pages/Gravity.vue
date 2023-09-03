<template>
  <input type="range" :min="0" :max="2 * Math.PI" :step="0.01" v-model.number="rotX" />
  <input type="range" :min="0" :max="2 * Math.PI" :step="0.01" v-model.number="rotY" />
  <canvas ref="canvas" class="w-screen h-screen"></canvas>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useAnimationFrames, useCanvasDPI } from '../utils/rxjsUtils';
import init, { random_world, ParticleWorld } from 'rust/pkg';
const { canvas, pixelSize } = useCanvasDPI();
const rotX = ref(0);
const rotY = ref(0);
const world = ref<ParticleWorld>();
init().then(() => {
  const { width, height } = pixelSize.value;
  world.value = random_world(width, height, 10);
});

watchEffect(() => {
  if (world.value) {
    console.log('rot');
    world.value.rotate(rotX.value, rotY.value);
  }
});

useAnimationFrames(({ elapsed }) => {
  world.value?.evolve();
  const points = world.value?.points();
  const ctx = canvas.value?.getContext('2d');
  if (points && ctx) {
    const N = points.length / 2;
    ctx.clearRect(0, 0, pixelSize.value.width, pixelSize.value.height);
    ctx.fillStyle = 'black';
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = points[i];
      const y = points[i + N];
      ctx.rect(x - 2, y - 2, 4, 4);
    }
    ctx.fill();
  }
});
</script>
