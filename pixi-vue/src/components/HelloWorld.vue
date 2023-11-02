<script setup lang="ts">
import { ref, shallowRef, triggerRef, watchEffect } from "vue";
import { usePixiAnimation } from "../renderer/renderer";
import { Graphics } from "pixi.js";
const val = ref(0);
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

let isDown = false;
function pointerdown() {
  isDown = true;
}
function pointerup() {
  isDown = false;
}
const position = ref({ x: 0, y: 0 });
function pointermove(event: PointerEvent) {
  if (isDown) {
    position.value.x += event.movementX;
    position.value.y += event.movementY;
  }
}

usePixiAnimation((ticker) => {
  rects.value.forEach((rect, i) => {
    rect.x = (i * 10) % 800;
    rect.y = Math.sin(ticker.lastTime / 10000 + i / 10) * 500 + 500;
  });
  triggerRef(rects);
});

function drawFn(g: Graphics) {
  g.circle(0, 0, 100).fill(0xff0000);
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
      <g-text fill="#fffcfc" :x="0" :y="0" :font-size="10">huhu</g-text>
    </g-container>
    <g-rect
      v-for="rect of rects"
      :y="rect.y"
      :x="rect.x"
      :width="rect.size"
      :height="rect.size"
      :fill="rect.fill"
      @click="rect.size += 1"
    ></g-rect>
  </g-container>
</template>

<style scoped></style>

