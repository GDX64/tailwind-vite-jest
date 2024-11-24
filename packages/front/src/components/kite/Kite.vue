<template>
  <canvas ref="canvas" class="w-full h-full min-h-screen pointer-events-none"></canvas>
</template>

<script lang="ts" setup>
import { vec3 } from 'gl-matrix';
import { useAnimationFrames, useCanvasDPI } from '../../utils/rxjsUtils';
import { Camera, KiteDraw } from './HandDraw';
import { IIRHighPassFilter, IIRLowPassFilter } from './IIRFilter';
import { onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  sampleRate: number;
}>();

const { canvas, size } = useCanvasDPI();
const BASE_HEIGHT = 4;
const BASE_X = 2;
const kite1 = new KiteDraw([BASE_X, BASE_HEIGHT, 0]);
let mouseY = 0;
let mouseX = 0;

onMounted(() => {
  document.addEventListener('pointermove', onPointerMove);
});

onUnmounted(() => {
  document.removeEventListener('pointermove', onPointerMove);
});

const samplingFactor = props.sampleRate / 60;
const centerFrequency = 0.5 * samplingFactor;
const lowCutOffFrequency = 0.1 * samplingFactor;
const filterY = new IIRHighPassFilter(centerFrequency, props.sampleRate);
const filterX1 = new IIRHighPassFilter(centerFrequency, props.sampleRate);

const filterX = (value: number) => {
  const x1 = filterX1.process(value);
  return x1;
};

const lowPassFilterX = new IIRLowPassFilter(lowCutOffFrequency, props.sampleRate);
const lowPassFilterY = new IIRLowPassFilter(lowCutOffFrequency, props.sampleRate);

const hightGain = 0.01;
const rotationGain = 0.005;
const lowGain = 3;

useAnimationFrames(({ delta }) => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx || !size.width || !size.height) return;

  ctx.save();
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.clearRect(0, 0, size.width, size.height);

  const yFilter = filterY.process(mouseY);
  const xFilter = filterX(mouseX);

  const lowX = lowPassFilterX.process(gaussianNoise()) * lowGain;
  const lowY = lowPassFilterY.process(gaussianNoise()) * lowGain;

  const x = -xFilter * hightGain + lowX + BASE_X;
  const y = yFilter * hightGain + lowY + BASE_HEIGHT;
  kite1.vertex.setRotation(
    Math.PI / 4 - yFilter * rotationGain,
    xFilter * rotationGain + lowX
  );
  kite1.vertex.setPosition(vec3.fromValues(x, y, 0));
  // kite1.vertex.rotateX(-Math.PI / 10);
  const camera = new Camera([size.width, size.height]);
  camera.update();
  kite1.evolve(Math.min(delta, 16) / 1000);
  kite1.draw(ctx, camera);
  ctx.restore();
});

function onPointerMove(event: PointerEvent) {
  mouseY += event.movementY > 0 ? event.movementY : 0;
  mouseX += event.movementX;
}

function gaussianNoise() {
  return Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
}
</script>
