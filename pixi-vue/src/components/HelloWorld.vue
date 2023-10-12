<script setup lang="ts">
import { h, ref, watchEffect } from "vue";
import { LayoutKind } from "../renderer/Layout";
const val = ref(0);
function randomColor() {
  return Math.floor(Math.random() * 0xffffff);
}
const rects = ref([
  {
    size: 50,
    fill: randomColor(),
  },
  {
    size: 50,
    fill: randomColor(),
  },
  {
    size: 50,
    fill: randomColor(),
  },
]);

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
watchEffect(() => {
  console.log(rects.value.map((item) => item.size));
});
</script>

<template>
  <g-rect
    :y="position.y"
    :x="position.x"
    @pointerdown="pointerdown"
    @pointerup="pointerup"
    @pointermove="pointermove"
    :fill="0xaaaaaa"
    :height="200"
    :width="200"
  >
    <g-rect :y="200" :x="50" :position="LayoutKind.HORIZONTAL">
      <g-rect
        @click="rects.push({ fill: randomColor(), size: 50 })"
        :fill="0x00ff00"
        :height="50"
        :width="80"
      >
        <g-text>Add</g-text>
      </g-rect>
      <g-rect @click="rects.pop()" :fill="0x00ffff" :height="50" :width="80">
        <g-text>remove</g-text>
      </g-rect>
    </g-rect>
    <g-rect :position="LayoutKind.HORIZONTAL" :fill="0xff0000" :height="100">
      <g-rect
        v-for="rect of rects"
        :width="rect.size"
        :height="rect.size"
        :fill="rect.fill"
        @click="rect.size += 1"
      ></g-rect>
    </g-rect>
  </g-rect>
</template>

<style scoped></style>

