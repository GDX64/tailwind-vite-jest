<template>
  <g-container>
    <g-sprite
      :x="position.x"
      :y="position.y"
      :rotation="rotation"
      :texture="texture"
      :scale="0.1"
    ></g-sprite>
  </g-container>
</template>

<script setup lang="ts">
import { shallowRef, ref } from "vue";
import {
  usePixiAnimation,
  usePixiAppData,
  usePixiApp,
} from "../renderer/renderer";
import { Assets, Point, Texture } from "pixi.js";
import baseSpritePath from "../assets/neon.png";
import { reactive, onUnmounted } from "vue";
const SCENE_WIDTH = 50;

const texture = shallowRef<Texture>();
Assets.load([baseSpritePath]).then(() => {
  texture.value = Texture.from(baseSpritePath);
});

class Boid {
  position;
}

const position = reactive(new Point(0, 0));
const rotation = ref(0);

const data = usePixiAppData();

const app = usePixiApp();
app.stage.position.set(data.width / 2, data.height / 2);
app.stage.scale.set(data.width / SCENE_WIDTH);
</script>
