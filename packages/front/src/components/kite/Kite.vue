<template>
  <canvas ref="canvas" class="w-full h-full pointer-events-none"></canvas>
</template>

<script lang="ts" setup>
import { vec3 } from 'gl-matrix';
import { useAnimationFrames, useCanvasDPI } from '../../utils/rxjsUtils';
import { Camera, KiteDraw } from './HandDraw';
import { onMounted, onUnmounted, ref, shallowRef } from 'vue';
import { designConfig } from '../../../tailwind.config';

const prime = designConfig.theme.colors.prime;
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

onMounted(() => {
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('click', onClick);
});

onUnmounted(() => {
  document.removeEventListener('pointermove', onPointerMove);
  document.removeEventListener('click', onClick);
});

useAnimationFrames(({ delta, elapsed }) => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx || !size.width || !size.height) return;

  ctx.save();
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.clearRect(0, 0, size.width, size.height);

  // kite1.vertex.rotateX(-Math.PI / 10);
  const camera = new Camera([size.width, size.height]);
  camera.position = [0, 0, 20];
  vec3.rotateY(
    camera.position,
    camera.position,
    [0, 0, 0],
    elapsed / 10_000 + Math.PI / 8
  );
  camera.update();
  const dt = Math.min(delta, 16) / 1000;

  shapes.value = kites.map((kite, index) => {
    if (selected.value === index) {
      const { mouseX, mouseY } = kite;
      kite.evolve(dt, mouseX, mouseY);
    } else {
      kite.evolve(dt);
    }
    if (index === isOverIndex.value) {
      return kite.draw(ctx, camera, { fill: prime[500] });
    } else if (index === selected.value) {
      return kite.draw(ctx, camera, { fill: prime[500] });
    } else {
      return kite.draw(ctx, camera, { fill: prime[900] });
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
    selected.value = over;
  }
}

function selectedKite() {
  return kites[selected.value];
}

function onPointerMove(event: PointerEvent) {
  selectedKite().updateMouse(event);
  isOverIndex.value = isOver(event);
}
</script>
