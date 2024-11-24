<template>
  <canvas ref="canvas" class="w-full h-full pointer-events-none"></canvas>
</template>

<script lang="ts" setup>
import { useAnimationFrames, useCanvasDPI } from '../../utils/rxjsUtils';
import { Camera, KiteDraw } from './HandDraw';
import { onMounted, onUnmounted, ref, shallowRef } from 'vue';

const props = defineProps<{
  sampleRate: number;
}>();

const { canvas, size } = useCanvasDPI();
const kites = [
  new KiteDraw([2, 4, 0], props.sampleRate),
  new KiteDraw([2, 2, -10], props.sampleRate),
  new KiteDraw([-10, -4, -10], props.sampleRate),
];

const selected = ref(0);
const shapes = shallowRef<Path2D[]>([]);
const isOverIndex = ref<number>();

let mouseY = 0;
let mouseX = 0;

onMounted(() => {
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('click', onClick);
});

onUnmounted(() => {
  document.removeEventListener('pointermove', onPointerMove);
  document.removeEventListener('click', onClick);
});

useAnimationFrames(({ delta }) => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx || !size.width || !size.height) return;

  ctx.save();
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.clearRect(0, 0, size.width, size.height);

  // kite1.vertex.rotateX(-Math.PI / 10);
  const camera = new Camera([size.width, size.height]);
  // camera.position = [];
  camera.update();
  const dt = Math.min(delta, 16) / 1000;

  shapes.value = kites.map((kite, index) => {
    if (selected.value === index) {
      kite.evolve(dt, mouseX, mouseY);
    } else {
      kite.evolve(dt);
    }
    if (index === isOverIndex.value) {
      return kite.draw(ctx, camera, { fill: '#0ea5e9' });
    } else if (index === selected.value) {
      return kite.draw(ctx, camera, { fill: '#0ea5e9' });
    } else {
      return kite.draw(ctx, camera, { fill: '#243c47' });
    }
  });

  ctx.restore();
});

function isOver(event: MouseEvent) {
  if (!canvas.value) return;

  const { x, y } = canvas.value.getBoundingClientRect();
  const offsetX = event.clientX - x;
  const offsetY = event.clientY - y;
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) return;
  const index = shapes.value.findIndex((shape) => {
    if (ctx.isPointInPath(shape, offsetX, offsetY)) {
      return true;
    }
  });
  if (index !== -1) {
    return index;
  }
}

function onClick(event: MouseEvent) {
  const over = isOver(event);
  if (over !== undefined) {
    mouseY = 0;
    mouseX = 0;
    selected.value = over;
  }
}

function onPointerMove(event: PointerEvent) {
  mouseY += event.movementY > 0 ? event.movementY : 0;
  mouseX += event.movementX;
  isOverIndex.value = isOver(event);
}
</script>
