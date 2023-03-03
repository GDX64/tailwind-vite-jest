<template>
  <BackGround>
    <h1>About noise</h1>
    <p>hello there</p>
    <canvas ref="canvas" :width="canvasWidth" :height="canvasWidth"></canvas>
  </BackGround>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';
import BackGround from '../BackGround.vue';
import * as d3 from 'd3';
import { bilinearInterpolation, Point2D } from '../../utils/math';
import { vec2 } from 'gl-matrix';
import { create } from 'domain';
import { clamp } from 'ramda';
const canvas = ref<HTMLCanvasElement>();
watchEffect(() => {
  if (canvas.value) {
    draw(canvas.value);
  }
});

const canvasWidth = 500;

function draw(canvas: HTMLCanvasElement) {
  const { width, height } = canvas;
  console.log({ width, height });
  const ctx = canvas.getContext('2d')!;
  //using cartesian coordinates
  ctx.fillStyle = 'white';
  const { grid, colorOf } = createGrid();
  ctx.save();
  d3.range(width).forEach((i) => {
    d3.range(height).forEach((j) => {
      const color = colorOf(i, j);
      ctx.globalAlpha = color;
      ctx.fillRect(i, j, 1, 1);
    });
  });
  ctx.restore();
  ctx.fillStyle = 'red';
  grid.flat().forEach(({ v, i, j }) => {
    arrow({ x: i, y: j }, { x: v[0], y: v[1] }, ctx);
  });
  ctx.restore();
}

function createGrid() {
  const gridRange = 10;
  const scale = d3.scaleLinear([0, gridRange - 1], [0, canvasWidth]);
  const grid = d3.range(gridRange).map((i) =>
    d3.range(gridRange).map((j) => {
      const v = vec2.random([1, 1]);
      vec2.normalize(v, v);
      return { v, i: scale(i), j: scale(j) };
    })
  );
  const colorScale = d3.scaleLinear([-1, 1], [0, 1]);
  function colorOf(x: number, y: number) {
    const i = Math.min(Math.floor(scale.invert(x)), gridRange - 2);
    const j = Math.min(Math.floor(scale.invert(y)), gridRange - 2);
    function calcvalue(i: number, j: number) {
      const scaled = [scale(i), scale(j)] as const;
      const cell = grid[i][j];
      let vDirection = vec2.sub([0, 0], scaled, [x, y]);
      vec2.normalize(vDirection, vDirection);
      const value = vec2.dot(vDirection, cell.v);
      return value;
    }
    const x1and2 = [scale(i), scale(i + 1)] as vec2;
    const y1and2 = [scale(j), scale(j + 1)] as vec2;
    const f11 = calcvalue(i, j);
    const f12 = calcvalue(i + 1, j);
    const f21 = calcvalue(i, j + 1);
    const f22 = calcvalue(i + 1, j + 1);
    const biLerp = bilinearInterpolation([x1and2, y1and2], [f11, f12, f21, f22]);
    const value = biLerp(x, y);
    return colorScale(value);
  }
  return { grid, colorOf };
}

function arrow(origin: Point2D, vec: Point2D, ctx: CanvasRenderingContext2D) {
  ctx.save();
  const vAngle = Math.atan2(vec.y, vec.x);
  // const vAngle = -degreesToRadians(180);
  ctx.translate(origin.x, origin.y);
  ctx.rotate(vAngle);
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(0, 5);
  ctx.lineTo(20, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
</script>
