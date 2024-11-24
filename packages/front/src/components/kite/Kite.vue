<template>
  <div class="absolute top-0 left-0"></div>
  <canvas
    ref="canvas"
    class="w-full h-full min-h-screen"
    @pointermove="onPointerMove"
  ></canvas>
</template>

<script lang="ts" setup>
import { vec3 } from 'gl-matrix';
import { useAnimationFrames, useCanvasDPI } from '../../utils/rxjsUtils';
import { Camera, KiteDraw } from './HandDraw';
import { IIRHighPassFilter, IIRLowPassFilter } from './IIRFilter';

const { canvas, size } = useCanvasDPI();
const kite1 = new KiteDraw([-2, 0, 0]);
let mouseY = 0;
let mouseX = 0;

const sampleRate = 60;
const centerFrequency = 0.5;
const filterY = new IIRHighPassFilter(centerFrequency, sampleRate);
const filterX1 = new IIRHighPassFilter(centerFrequency, sampleRate);
const filterX = (value: number) => {
  const x1 = filterX1.process(value);
  return x1;
};

const lowCutOffFrequency = 0.1;
const lowPassFilterX = new IIRLowPassFilter(lowCutOffFrequency, sampleRate);
const lowPassFilterY = new IIRLowPassFilter(lowCutOffFrequency, sampleRate);

const hightGain = 0.01;
const rotationGain = 0.003;
const lowGain = 2;

const BASE_HEIGHT = 2;

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

  const x = -xFilter * hightGain + lowX;
  const y = yFilter * hightGain + lowY + BASE_HEIGHT;
  kite1.vertex.setRotation(Math.PI / 4 - yFilter * rotationGain, xFilter * rotationGain);
  kite1.vertex.setPosition(vec3.fromValues(x, y, 0));
  // kite1.vertex.rotateX(-Math.PI / 10);
  const camera = new Camera([size.width, size.height]);
  camera.update();
  kite1.evolve(delta / 1000);
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
