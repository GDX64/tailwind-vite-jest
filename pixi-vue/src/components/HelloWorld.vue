<script setup lang="ts">
import { ref, shallowRef, triggerRef, watchEffect } from "vue";
import {
  usePixiAnimation,
  usePixiAppData,
  usePixiApp,
} from "../renderer/renderer";
import {
  Graphics,
  FillGradient,
  Text,
  MaskFilter,
  Assets,
  Sprite,
  Container,
  RenderTexture,
} from "pixi.js";
import TestLine from "./TestLine.vue";
import baseSpritePath from "../assets/neon.png";

const texture = RenderTexture.create({
  width: 64,
  height: 64,
});

const app = usePixiApp();
Assets.load([baseSpritePath]).then(() => {
  const sprite = Sprite.from(baseSpritePath);
  const g = new Graphics();
  const grad = new FillGradient(0, 0, 64, 64);
  grad.addColorStop(0, 0x000000);
  grad.addColorStop(1, 0xff0000);
  g.circle(0, 0, 100).fill(grad);
  g.mask = sprite;
  // g.blendMode = "soft-light";
  const container = new Container();
  container.addChild(sprite, g);
  app.renderer.render({
    container: container,
    target: texture,
    clear: true,
  });
});

function randomColor() {
  return Math.floor(Math.random() * 0xffffff);
}
const rects = shallowRef(
  [...Array(500)].map(() => {
    return {
      y: 0,
      x: 0,
      size: 1 / 2,
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

const position = ref({ x: data.width / 2, y: data.height / 2 });
const linePoints = [
  { x: 0, y: 0 },
  { x: 100, y: 100 },
  { x: 200, y: 0 },
];
const pixiText = centeredText();

function centeredText() {
  const pixiText = new Text({
    text: "Those evas were rendered to a texture",
    renderMode: "bitmap",
    style: {
      fontSize: 22,
      fill: "#00a2ff",
    },
  });
  const { width } = pixiText.getBounds();
  pixiText.x = -width / 2;
  return pixiText;
}

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
</script>

<template>
  <g-container>
    <g-rect
      :width="data.width"
      :height="data.height"
      :fill="'#e8d8b6'"
    ></g-rect>
    <g-container :x="position.x" :y="position.y">
      <!-- <g-raw :pixiEl="eva"></g-raw> -->
      <g-raw :pixiEl="pixiText" :y="32"></g-raw>
    </g-container>
    <TestLine :points="linePoints" :y="300"></TestLine>
    <g-sprite
      v-for="rect of rects"
      :y="rect.y"
      :x="rect.x"
      :width="rect.size"
      :height="rect.size"
      :texture="texture"
    ></g-sprite>
  </g-container>
</template>

<style scoped></style>

