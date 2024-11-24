<template>
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
import { IIRBandPassFilter, IIRHighPassFilter, IIRLowPassFilter } from './IIRFilter';

const { canvas, pixelSize } = useCanvasDPI();
const kite1 = new KiteDraw([-2, 0, 0]);
let mouseY = 0;
let mouseX = 0;

const sampleRate = 60;
const centerFrequency = 15;
const bandwidth = 7;
const filterX = new IIRBandPassFilter(centerFrequency, bandwidth, sampleRate);
const filterY = new IIRBandPassFilter(centerFrequency, bandwidth, sampleRate);

const lowCutOffFrequency = 0.1;
const lowPassFilterX = new IIRLowPassFilter(lowCutOffFrequency, sampleRate);
const lowPassFilterY = new IIRLowPassFilter(lowCutOffFrequency, sampleRate);

const hightGain = 0.01;
const rotationGain = 0.003;
const lowGain = 2;

useAnimationFrames(({ elapsed }) => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx || !pixelSize.value.width || !pixelSize.value.height) return;

  ctx.clearRect(0, 0, pixelSize.value.width, pixelSize.value.height);

  const yFilter = filterY.process(mouseY);
  const xFilter = filterX.process(mouseX);

  const lowX = lowPassFilterX.process(gaussianNoise()) * lowGain;
  const lowY = lowPassFilterY.process(gaussianNoise()) * lowGain;

  const x = -xFilter * hightGain + lowX;
  const y = yFilter * hightGain + lowY;
  kite1.vertex.setRotation(Math.PI / 4 - yFilter * rotationGain, xFilter * rotationGain);
  kite1.vertex.setPosition(vec3.fromValues(x, y, 0));
  // kite1.vertex.rotateX(-Math.PI / 10);
  const camera = new Camera([pixelSize.value.width, pixelSize.value.height]);
  camera.update();
  kite1.evolve(0.016);
  kite1.draw(ctx, camera);
});

function onPointerMove(event: PointerEvent) {
  mouseY += event.movementY > 0 ? event.movementY : 0;
  mouseX = event.clientX;
}

function gaussianNoise() {
  return Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
}
</script>
