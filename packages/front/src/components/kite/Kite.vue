<template>
  <canvas ref="canvas" class="w-full h-full pointer-events-none absolute top-0 left-0">
    <!-- <Teleport to="body">
      <div class="absolute top-24 left-24">
        <input
          type="range"
          min="20"
          max="50"
          step="0.1"
          v-model.number="cameraDistance"
        />
      </div>
    </Teleport> -->
  </canvas>
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

const roughness = ref(1.5);
const cameraDistance = ref(30);

const { canvas, size } = useCanvasDPI();
const kites = [
  new KiteDraw([2, 5, 0], props.sampleRate, 1),
  new KiteDraw([2, 2, -10], props.sampleRate, 2),
  new KiteDraw([-10, -4, -10], props.sampleRate, 3),
];

const selected = ref(1);
const isOverID = ref<number>();

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
  const d = 10 * Math.sin(elapsed / 5000 - Math.PI / 2);
  camera.position = [0, 0, d + cameraDistance.value];
  vec3.rotateY(
    camera.position,
    camera.position,
    [0, 0, 0],
    -elapsed / 10_000 + Math.PI * 1.1
  );
  camera.update();
  const dt = Math.min(delta, 16) / 1000;

  //we need to sort the kites by their z position
  //so we can draw the ones that are closer to the camera last
  [...kites]
    .sort((a, b) => {
      return b.zCamera(camera) - a.zCamera(camera);
    })
    .forEach((kite) => {
      if (selected.value === kite.id) {
        const { mouseX, mouseY } = kite;
        kite.evolve(dt, mouseX, mouseY);
      } else {
        kite.evolve(dt);
      }
      if (kite.id === isOverID.value) {
        return kite.draw(ctx, camera, { fill: prime[400], roughness: roughness.value });
      } else if (kite.id === selected.value) {
        return kite.draw(ctx, camera, { fill: prime[400], roughness: roughness.value });
      } else {
        return kite.draw(ctx, camera, { fill: prime[100], roughness: roughness.value });
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
  const kite = kites.find((kite) => {
    if (ctx.isPointInPath(kite.shape, offsetX, offsetY)) {
      return true;
    }
  });
  if (kite) {
    return kite.id;
  }
}

function onClick(event: MouseEvent) {
  const over = isOver(event);
  if (over !== undefined) {
    selected.value = over;
  }
}

function selectedKite() {
  return kites.find((kite) => kite.id === selected.value);
}

function onPointerMove(event: PointerEvent) {
  selectedKite()?.updateMouse(event);
  isOverID.value = isOver(event);
}
</script>
