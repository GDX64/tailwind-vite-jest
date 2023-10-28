<script setup lang="ts">
import { ref, watchEffect } from "vue";
const val = ref(0);
function randomColor() {
  return Math.floor(Math.random() * 0xffffff);
}
const rects = ref([
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
    <g-rect
      v-for="rect of rects"
      :width="rect.size"
      :height="rect.size"
      :fill="rect.fill"
      @click="rect.size += 1"
    ></g-rect>
  </g-rect>
</template>

<style scoped></style>

