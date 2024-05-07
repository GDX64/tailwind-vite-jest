<template>
  <g-container>
    <g-sprite
      v-for="boid in boids"
      :x="boid.position.x"
      :y="boid.position.y"
      :rotation="boid.rotation"
      :texture="texture"
      :scale="0.03"
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
import { Assets, Point, Texture } from "pixi.js";
import baseSpritePath from "../assets/neon.png";
import { reactive, onUnmounted } from "vue";
import { Vec2 } from "../utils/Vec2";

const SCENE_WIDTH = 50;

const texture = shallowRef<Texture>();
Assets.load([baseSpritePath]).then(() => {
  texture.value = Texture.from(baseSpritePath);
});

class Boid {
  position = new Vec2(0, 0);
  velocity = new Vec2(0, 0);

  get rotation() {
    return Math.atan2(this.velocity.y, this.velocity.x);
  }

  isNear(other: Boid) {
    return this.position.sub(other.position).length() < 10;
  }
}

const boids = shallowRef<Boid[]>([]);

boids.value = Array.from({ length: 100 }, () => {
  const boid = new Boid();
  boid.position.x = Math.random() * SCENE_WIDTH - SCENE_WIDTH / 2;
  boid.position.y = Math.random() * SCENE_WIDTH - SCENE_WIDTH / 2;
  boid.velocity.set(Math.random() * 2 - 1, Math.random() * 2 - 1);
  return boid;
});

const data = usePixiAppData();

usePixiAnimation(() => {
  const dt = 0.016;
  boids.value.forEach((boid) => {
    boid.position = boid.position.add(boid.velocity.scale(dt));
    boid.position.x = boid.position.x % SCENE_WIDTH;
    boid.position.y = boid.position.y % SCENE_WIDTH;
  });
  triggerRef(boids);
});

const app = usePixiApp();
app.stage.position.set(data.width / 2, data.height / 2);
app.stage.scale.set(data.width / SCENE_WIDTH);
</script>
