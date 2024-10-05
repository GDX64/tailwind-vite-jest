<template>
  <canvas ref="canvas" class="my-canvas" @pointermove="onPointerMove"></canvas>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue';
import { useCanvasDPI, useSize } from '../../utils/rxjsUtils';
import { GridIndex } from './GridIndex';
import { Vec2 } from '../../utils/Vec2';
import { Entity, SpaceIndex } from './SpaceIndexTypes';
import { LinScale } from '../../utils/LinScale';

const CIRCLES = 500;
const GRID_SIZE = 100;
const R = 15;

const props = defineProps<{
  kind: 'quadtree' | 'grid';
}>();

const pointerPositon = ref(Vec2.new(0, 0));

const { canvas, size } = useCanvasDPI();

const collection: SpaceIndex<Circle> = new GridIndex(10, 100);

onMounted(() => {
  for (const circle of randCircles()) {
    collection.insert(circle);
  }
});

watchEffect(() => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) {
    return;
  }
  const scaleX = LinScale.fromPoints(0, 0, GRID_SIZE, size.width);
  const scaleY = LinScale.fromPoints(0, 0, GRID_SIZE, size.height);
  const worldPointer = Vec2.new(
    scaleX.invert(pointerPositon.value.x),
    scaleY.invert(pointerPositon.value.y)
  );

  ctx.save();
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.clearRect(0, 0, size.width, size.height);
  collection.drawQuery(worldPointer, R, ctx);

  ctx.fillStyle = '#ff0000';

  const drawCircle = (circle: Circle) => {
    ctx.beginPath();
    const { x, y } = circle.position();
    ctx.arc(scaleX.scale(x), scaleY.scale(y), circle.radius, 0, 2 * Math.PI);
    ctx.fill();
  };

  for (const circle of collection.iter()) {
    drawCircle(circle);
  }
  const nearPointer = collection.query(worldPointer, R);
  for (const circle of nearPointer) {
    ctx.fillStyle = '#00ff00';
    drawCircle(circle);
  }
  ctx.restore();
});

function randCircles() {
  const circles = Array.from({ length: CIRCLES }, () => {
    return new Circle(Vec2.new(Math.random() * GRID_SIZE, Math.random() * GRID_SIZE), 5);
  });
  return circles;
}

class Circle implements Entity {
  constructor(public pos: Vec2, public radius: number) {}

  position(): Vec2 {
    return this.pos;
  }
}

function onPointerMove(e: PointerEvent) {
  pointerPositon.value = Vec2.new(e.offsetX, e.offsetY);
}
</script>

<style>
.my-canvas {
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1;
  border: 1px solid white;
  touch-action: none;
}
</style>
