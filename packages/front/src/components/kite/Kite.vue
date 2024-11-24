<template>
  <canvas ref="canvas" class="w-full h-full min-h-screen pointer-events-none"></canvas>
</template>

<script lang="ts" setup>
import { useAnimationFrames, useCanvasDPI } from '../../utils/rxjsUtils';
import { Camera, KiteDraw } from './HandDraw';
import { onMounted, onUnmounted, ref } from 'vue';

const props = defineProps<{
  sampleRate: number;
}>();

const { canvas, size } = useCanvasDPI();
const kites = [
  new KiteDraw([0, 4, 0], props.sampleRate),
  new KiteDraw([7, 2, -10], props.sampleRate),
  new KiteDraw([-20, 10, -30], props.sampleRate),
];

const selected = ref(0);

let mouseY = 0;
let mouseX = 0;

onMounted(() => {
  document.addEventListener('pointermove', onPointerMove);
});

onUnmounted(() => {
  document.removeEventListener('pointermove', onPointerMove);
});

useAnimationFrames(({ delta }) => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx || !size.width || !size.height) return;

  ctx.save();
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.clearRect(0, 0, size.width, size.height);

  // kite1.vertex.rotateX(-Math.PI / 10);
  const camera = new Camera([size.width, size.height]);
  camera.update();
  const dt = Math.min(delta, 16) / 1000;

  kites.forEach((kite, index) => {
    if (selected.value === index) {
      kite.evolve(dt, mouseX, mouseY);
    } else {
      kite.evolve(dt, 0, 0);
    }
    kite.draw(ctx, camera);
  });

  ctx.restore();
});

function onPointerMove(event: PointerEvent) {
  mouseY += event.movementY > 0 ? event.movementY : 0;
  mouseX += event.movementX;
}
</script>
