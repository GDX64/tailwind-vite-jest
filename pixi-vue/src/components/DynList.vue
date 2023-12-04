<template>
  <g-container
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
  >
    <g-rect :width="data.width" :height="data.height" fill="#bda7dd"></g-rect>
    <g-container :y="-scroll">
      <template v-for="(row, i) of rows" :key="row.key">
        <g-container
          :y="ROW_HEIGHT * i"
          v-if="
            ROW_HEIGHT * i - scroll > 0 && ROW_HEIGHT * i - scroll < data.height
          "
        >
          <g-container>
            <g-sprite :texture="row.image()" :scale="0.5"></g-sprite>
            <g-text :fontSize="16" :x="imageSize().width / 2 + 10" :y="0"
              >hello</g-text
            >
            <g-text
              :x="imageSize().width / 2 + 10"
              :y="25"
              :fontSize="16"
              :fill="row.color()"
              >{{ row.name }}</g-text
            >
          </g-container>
          <g-container :x="data.width / 3">
            <g-text :fontSize="16" :x="imageSize().width + 10" :y="0">{{
              row.age
            }}</g-text>
            <g-text
              :x="imageSize().width + 10"
              :y="25"
              :fontSize="16"
              :fill="row.color()"
              >{{ row.height }}</g-text
            >
          </g-container>
          <g-container :x="(data.width / 3) * 2">
            <g-text :fontSize="16" :x="imageSize().width + 10" :y="0">{{
              row.weight
            }}</g-text>
            <g-text
              :x="imageSize().width + 10"
              :y="25"
              :fontSize="16"
              :fill="row.color()"
              >{{ row.weight }}</g-text
            >
          </g-container>
        </g-container>
      </template>
    </g-container>
  </g-container>
</template>

<script setup lang="ts">
import { shallowRef } from "vue";
import { usePixiAnimation, usePixiAppData } from "../renderer/renderer";
import { Assets, Point, Texture } from "pixi.js";
import baseSpritePath from "../assets/neon.png";
import { reactive } from "vue";
import { ref } from "vue";

const texture = shallowRef<Texture>();
let pointerIsDown = false;
Assets.load([baseSpritePath]).then(() => {
  texture.value = Texture.from(baseSpritePath);
});
const scroll = ref(0);
const ROW_HEIGHT = 45;

const data = usePixiAppData();

const rows = reactive(
  [...Array(50)].map(() => {
    return {
      name: "hello",
      age: random(10, 100),
      height: random(10, 100),
      weight: random(10, 100),
      isPositive: Math.random() > 0.5,
      color() {
        return this.isPositive ? "#b14141" : "#41b141";
      },
      image: () => texture.value,
      key: Math.random(),
    };
  })
);

const totalHeight = () => rows.length * ROW_HEIGHT;

usePixiAnimation(() => {
  for (let i = 0; i < 2; i++) {
    const chosen = Math.floor(Math.random() * rows.length);
    const row = rows[chosen];
    const propKey = Math.floor(Math.random() * 4);
    if (propKey === 0) row.weight = random(10, 100);
    if (propKey === 1) row.age = random(10, 100);
    if (propKey === 2) row.height = random(10, 100);
    if (propKey === 3) row.isPositive = Math.random() > 0.5;
  }
});

function random(min: number, max: number) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function imageSize() {
  const { width = 0, height = 0 } = texture.value ?? {};
  return { width, height };
}

function onPointerDown() {
  pointerIsDown = true;
}

function onPointerUp() {
  pointerIsDown = false;
}

function onPointerMove(event: PointerEvent) {
  if (pointerIsDown) {
    const height = totalHeight();
    const screenHeight = data.height;
    scroll.value -= event.movementY;
    scroll.value = Math.max(0, Math.min(scroll.value, height - screenHeight));
  }
}
</script>
