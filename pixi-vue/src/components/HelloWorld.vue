<script setup lang="ts">
import { h, ref } from "vue";
import { LayoutKind } from "../renderer/Layout";
const val = ref(0);
function randomColor() {
  return Math.floor(Math.random() * 0xffffff);
}
const rects = ref([
  {
    height: 50,
    fill: randomColor(),
  },
  {
    height: 50,
    fill: randomColor(),
  },
  {
    height: 50,
    fill: randomColor(),
  },
]);
</script>

<template>
  <g-rect :position="LayoutKind.HORIZONTAL" :fill="0xaaaaaa" :height="200">
    <g-rect
      :position="LayoutKind.HORIZONTAL"
      :fill="0xff0000"
      :height="100"
      @click="val += 1"
    >
      <g-rect
        v-for="rect of rects"
        :width="50"
        :height="rect.height"
        :fill="rect.fill"
        @click="rect.height += 10"
      ></g-rect>
    </g-rect>
    <g-rect
      :position="LayoutKind.HORIZONTAL"
      :width="100"
      :fill="randomColor()"
      :height="100"
      @click="val += 1"
    >
      <g-text :font-size="12" :fill="0xffffff">This is very crazy stuff</g-text>
    </g-rect>
    <g-rect
      :position="LayoutKind.HORIZONTAL"
      :fill="randomColor()"
      :height="100"
      @click="val += 1"
      v-once
    >
      <g-rect :width="50" :height="50" :fill="randomColor()"></g-rect>
      <g-rect :width="50" :height="50" :fill="randomColor()"></g-rect>
      <g-rect :width="50" :height="50" :fill="randomColor()"></g-rect>
      <g-rect :width="50" :height="50" :fill="randomColor()"></g-rect>
    </g-rect>
  </g-rect>
</template>

<style scoped></style>

