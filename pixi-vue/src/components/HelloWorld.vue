<script setup lang="ts">
import { ref, shallowRef, triggerRef, watchEffect } from "vue";
import { usePixiAnimation, usePixiAppData } from "../renderer/renderer";
import { Graphics, FillGradient, Text, Rectangle } from "pixi.js";
import TestLine from "./TestLine.vue";
function randomColor() {
  return Math.floor(Math.random() * 0xffffff);
}
const rects = shallowRef(
  [...Array(100)].map(() => {
    return {
      y: 0,
      x: 0,
      size: 10,
      fill: randomColor(),
    };
  })
);

const data = usePixiAppData();
const alpha = ref(0.1);

usePixiAnimation((ticker) => {
  const { width, height } = data;
  rects.value.forEach((rect, i) => {
    rect.x = (i * 10) % width;
    rect.y =
      (Math.sin(ticker.lastTime / 10000 + i / 10) * height) / 2 + height / 2;
  });
  triggerRef(rects);
});

const position = ref({ x: 100, y: 100 });
const pixiText = new Text({
  text: "huhu",
  renderMode: "canvas",
  style: {
    fontSize: 22,
    fill: "#fffcfc",
    align: "center",
    textBaseline: "middle",
  },
});

const linePoints = [
  { x: 0, y: 0 },
  { x: 100, y: 100 },
  { x: 200, y: 0 },
];

let isDown = false;
function pointerdown() {
  console.log("pointerdown");
  isDown = true;
}
function pointerup() {
  isDown = false;
}
function pointermove(event: PointerEvent) {
  if (isDown) {
    position.value.x += event.movementX;
    position.value.y += event.movementY;
    alpha.value = Math.max(0.1, position.value.x / data.width);
  }
}

function drawFn(g: Graphics) {
  const grad = new FillGradient(-100, -100, 100, 100);
  grad.addColorStop(0, 0x000000);
  grad.addColorStop(1, 0xff0000);
  g.circle(0, 0, 100).fill(grad);
  g.hitArea = new Rectangle(-100, -100, 200, 200);
  g.moveTo(0, 100)
    .lineTo(0, -100)
    .moveTo(100, 0)
    .lineTo(-100, 0)
    .stroke({ color: 0xffffff, width: 1 });
}
</script>

<template>
  <g-container>
    <g-container :x="position.x" :y="position.y">
      <g-rect
        @pointermove="pointermove"
        @pointerdown="pointerdown"
        @pointerup="pointerup"
        :drawfn="drawFn"
      ></g-rect>
      <g-text :pixiEl="pixiText" :x="0" :y="0"> huhu </g-text>
    </g-container>
    <TestLine :points="linePoints"></TestLine>
    <g-rect
      v-for="rect of rects"
      :y="rect.y"
      :x="rect.x"
      :width="rect.size"
      :height="rect.size"
      :fill="rect.fill"
      :alpha="alpha"
    ></g-rect>
  </g-container>
</template>

<style scoped></style>

