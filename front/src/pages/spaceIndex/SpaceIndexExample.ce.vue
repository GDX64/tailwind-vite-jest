<template>
  <div class="container">
    <div class="">
      <label>Calc Time: </label>
      <span>{{ drawTime.toFixed(2) }}ms</span>
    </div>
    <canvas ref="canvas" class="my-canvas" @pointermove="onPointerMove"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue';
import { useAnimationFrames, useCanvasDPI, useSize } from '../../utils/rxjsUtils';
import { GridIndex } from './GridIndex';
import { Vec2 } from '../../utils/Vec2';
import { Entity, SpaceIndex } from './SpaceIndexTypes';
import { LinScale } from '../../utils/LinScale';
import { measureTime } from '../../utils/benchMark';

const CIRCLES = 500;
const GRID_SIZE = 100;
const CIRC_RADIUS = 1;
const R = 15;
const V = 10;

const props = defineProps<{
  kind: 'quadtree' | 'grid';
}>();

const drawTime = ref(0);

const pointerPositon = ref(Vec2.new(0, 0));

const { canvas, size } = useCanvasDPI();

let collection: SpaceIndex<Circle> = createCollection();

onMounted(() => {
  for (const circle of randCircles()) {
    collection.insert(circle);
  }
});

useAnimationFrames(({ delta }) => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) {
    return;
  }
  const { elapsed } = measureTime(() => {
    evolveSimulation(delta / 1000);
  });

  drawTime.value = elapsed;

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

  const r = scaleX.alpha * CIRC_RADIUS;
  const drawCircle = (circle: Circle) => {
    ctx.beginPath();
    const { x, y } = circle.position();
    ctx.arc(scaleX.scale(x), scaleY.scale(y), r, 0, 2 * Math.PI);
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

function evolveSimulation(dt: number) {
  const newCircles: Circle[] = [];
  for (const circle of collection.iter()) {
    const near = collection.query(circle.position(), circle.radius * 2);
    const newCircle = circle.clone();
    for (const other of near) {
      if (circle !== other) {
        newCircle.collide(other);
      }
    }
    newCircles.push(newCircle);
  }

  collection = createCollection();

  for (const circle of newCircles) {
    const deltaV = circle.v.mul(dt);
    circle.pos = circle.pos.add(deltaV);
    const hitsX = circle.position().x < 0 || circle.position().x > GRID_SIZE;
    const hitsY = circle.position().y < 0 || circle.position().y > GRID_SIZE;

    if (hitsX) {
      circle.v = Vec2.new(-circle.v.x, circle.v.y);
    }
    if (hitsY) {
      circle.v = Vec2.new(circle.v.x, -circle.v.y);
    }
    if (hitsX || hitsY) {
      circle.pos = Vec2.new(
        Math.max(0, Math.min(GRID_SIZE, circle.pos.x)),
        Math.max(0, Math.min(GRID_SIZE, circle.pos.y))
      );
    }

    collection.insert(circle);
  }
}

function createCollection() {
  return new GridIndex<Circle>(10, 100);
}

function randCircles() {
  const circles = Array.from({ length: CIRCLES }, () => {
    const v = Vec2.new((Math.random() * 2 - 1) * V, (Math.random() * 2 - 1) * V);
    return new Circle(
      Vec2.new(Math.random() * GRID_SIZE, Math.random() * GRID_SIZE),
      CIRC_RADIUS,
      v
    );
  });
  return circles;
}

class Circle implements Entity {
  constructor(public pos: Vec2, public radius: number, public v: Vec2) {}

  position(): Vec2 {
    return this.pos;
  }

  clone() {
    return new Circle(this.pos.clone(), this.radius, this.v.clone());
  }

  collide(other: Circle) {
    const delta = other.pos.sub(this.pos);
    const dist = delta.length();
    const overlap = this.radius + other.radius - dist;
    if (overlap > 0) {
      const normal = delta.div(dist);
      const mtd = normal.mul(overlap);
      this.pos = this.pos.sub(mtd.div(2));
      this.v = other.v;
    }
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
