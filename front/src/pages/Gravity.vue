<template>
  <div class="flex flex-col h-screen w-screen overflow-hidden">
    <div class="flex px-2 py-4 gap-2 bg-sky-200 border-sky-600 border-b-2">
      <input type="range" :min="0" :max="180" :step="1" v-model.number="rotX" />
      <input type="range" :min="0" :max="180" :step="1" v-model.number="rotY" />
      <input type="range" :min="0" :max="180" :step="1" v-model.number="rotZ" />
    </div>
    <div class="h-full grow relative bg-amber-100">
      <canvas
        ref="canvas"
        class="absolute top-0 left-0 w-full h-full"
        @click="onClick"
      ></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useAnimationFrames, useCanvasDPI } from '../utils/rxjsUtils';
import init, { random_world, ParticleWorld } from 'rust/pkg';
const { canvas, pixelSize } = useCanvasDPI();
const rotX = ref(30);
const rotY = ref(30);
const rotZ = ref(0);
const world = ref<ParticleWorld>();
const particleSize = Math.round(4 * devicePixelRatio);
init().then(() => {
  const { width, height } = pixelSize.value;
  world.value = random_world(width, height, 150);
});

function onClick(event: MouseEvent) {
  const { clientX, clientY } = event;
  const m = projectionMatrix();
  const p = m.inverse().transformPoint({
    x: clientX * devicePixelRatio,
    y: clientY * devicePixelRatio,
    z: 0,
  });
  world.value?.set_center(p.x, p.y);
}

useAnimationFrames(({ elapsed }) => {
  world.value?.evolve();
  const points = world.value?.points();
  const ctx = canvas.value?.getContext('2d');
  if (points && ctx) {
    const N = points.length;
    ctx.clearRect(0, 0, pixelSize.value.width, pixelSize.value.height);
    const m = projectionMatrix();
    ctx.fillStyle = 'black';
    ctx.lineWidth = Math.round(devicePixelRatio);
    const xLims = [Infinity, -Infinity];
    const yLims = [Infinity, -Infinity];
    const zLims = [Infinity, -Infinity];
    for (let i = 0; i < N; i += 3) {
      const x = points[i];
      const y = points[i + 1];
      const z = points[i + 2];
      const res = m.transformPoint({ x, y, z });
      xLims[0] = Math.min(xLims[0], x);
      xLims[1] = Math.max(xLims[1], x);
      yLims[0] = Math.min(yLims[0], y);
      yLims[1] = Math.max(yLims[1], y);
      zLims[0] = Math.min(zLims[0], z);
      zLims[1] = Math.max(zLims[1], z);
      // ctx.fillStyle = `#000000${Math.min(50, 255 - z).toString(16)}}`;
      // console.log([x, y]);
      ctx.beginPath();
      ctx.arc(Math.round(res.x), Math.round(res.y), particleSize, 0, 2 * Math.PI);
      ctx.fill();
    }

    const midX = (xLims[0] + xLims[1]) / 2;
    const midY = (yLims[0] + yLims[1]) / 2;
    ctx.fillStyle = '#ff000022';
    ctx.strokeStyle = '#ff0000';
    strokeRectWith4Points(
      ctx,
      new DOMPoint(xLims[0], yLims[0], 0),
      new DOMPoint(xLims[1], yLims[0], 0),
      new DOMPoint(xLims[1], yLims[1], 0),
      new DOMPoint(xLims[0], yLims[1], 0)
    );
    ctx.fillStyle = '#0000ff22';
    ctx.strokeStyle = '#0000ff';
    strokeRectWith4Points(
      ctx,
      new DOMPoint(midX, yLims[0], zLims[0]),
      new DOMPoint(midX, yLims[0], zLims[1]),
      new DOMPoint(midX, yLims[1], zLims[1]),
      new DOMPoint(midX, yLims[1], zLims[0])
    );
    ctx.fillStyle = '#00ff0022';
    ctx.strokeStyle = '#00ff00';
    strokeRectWith4Points(
      ctx,
      new DOMPoint(xLims[0], midY, zLims[0]),
      new DOMPoint(xLims[0], midY, zLims[1]),
      new DOMPoint(xLims[1], midY, zLims[1]),
      new DOMPoint(xLims[1], midY, zLims[0])
    );
  }
});

function strokeRectWith4Points(
  ctx: CanvasRenderingContext2D,
  _p1: DOMPoint,
  _p2: DOMPoint,
  _p3: DOMPoint,
  _p4: DOMPoint
) {
  const m = projectionMatrix();
  const p1 = m.transformPoint(_p1);
  const p2 = m.transformPoint(_p2);
  const p3 = m.transformPoint(_p3);
  const p4 = m.transformPoint(_p4);
  ctx.beginPath();
  ctx.moveTo(Math.round(p1.x), Math.round(p1.y));
  ctx.lineTo(Math.round(p2.x), Math.round(p2.y));
  ctx.lineTo(Math.round(p3.x), Math.round(p3.y));
  ctx.lineTo(Math.round(p4.x), Math.round(p4.y));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function projectionMatrix() {
  const m = new DOMMatrix();
  const rotation = m.scale(2, 2).rotate(rotX.value, rotY.value, rotZ.value);
  const translation = m.translate(
    pixelSize.value.width / 2,
    pixelSize.value.height / 2,
    0
  );
  return translation.multiply(rotation);
}
</script>
