<template>
  <g-container v-if="texture">
    <g-sprite
      v-for="boid in boids.boids"
      :x="boid.position.x"
      :y="boid.position.y"
      :rotation="boid.rotation + Math.PI / 2"
      :texture="texture"
      :width="1"
      :height="texture.height / texture.width"
    ></g-sprite>
  </g-container>
</template>

<script setup lang="ts">
import { shallowRef, triggerRef } from "vue";
import {
  usePixiAnimation,
  usePixiAppData,
  usePixiApp,
} from "../renderer/renderer";
import { Assets, Texture } from "pixi.js";
import baseSpritePath from "../assets/bat.png";
import { BoidsWorld } from "./BoidsWorld";

const SCENE_WIDTH = 50;

const texture = shallowRef<Texture>();
Assets.load([baseSpritePath]).then(() => {
  texture.value = Texture.from(baseSpritePath);
});

const boids = shallowRef<BoidsWorld>(new BoidsWorld());

const data = usePixiAppData();
const app = usePixiApp();

usePixiAnimation(() => {
  boids.value.update();
  triggerRef(boids);
});

app.stage.scale.set(data.width / SCENE_WIDTH);
app.renderer.background.color = 0xffffff;
const sceneHeight = Math.floor((app.screen.height * SCENE_WIDTH) / data.width);
boids.value.sceneWidth = SCENE_WIDTH;
boids.value.sceneHeight = sceneHeight;
boids.value.create(100);
</script>
