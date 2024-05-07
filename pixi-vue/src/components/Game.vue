<template>
  <g-container v-if="texture">
    <g-sprite
      v-for="boid in boids"
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
import { Assets, Point, Texture } from "pixi.js";
import baseSpritePath from "../assets/bat.png";
import { Vec2 } from "../utils/Vec2";

const SCENE_WIDTH = 50;
const SPEED = 1;

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

  isTooClose(other: Boid) {
    return this.position.sub(other.position).length() < 2;
  }

  isNear(other: Boid) {
    return this.position.sub(other.position).length() < 5;
  }
}

const boids = shallowRef<Boid[]>([]);

boids.value = Array.from({ length: 10 }, () => {
  const boid = new Boid();
  boid.position.x = Math.random() * SCENE_WIDTH - SCENE_WIDTH / 2;
  boid.position.y = Math.random() * SCENE_WIDTH - SCENE_WIDTH / 2;
  boid.velocity.set(Math.random() * 2 - 1, Math.random() * 2 - 1);
  boid.velocity = boid.velocity.normalize().scale(SPEED);
  return boid;
});

const data = usePixiAppData();
const app = usePixiApp();

usePixiAnimation(() => {
  const dt = 0.016;
  boids.value.forEach((boid) => {
    let velocity = boid.velocity;
    let posSum = new Vec2(0, 0);
    let nearCount = 0;
    boids.value.forEach((other) => {
      if (boid !== other && boid.isTooClose(other)) {
        velocity = other.position
          .sub(boid.position)
          .normalize()
          .scale(-0.05 * boid.velocity.length())
          .add(boid.velocity);
      } else if (boid !== other && boid.isNear(other)) {
        velocity = velocity.add(other.velocity.scale(0.01));
        posSum = posSum.add(other.position);
        nearCount += 1;
      }
    });
    const nearAverage = posSum.scale(1 / nearCount);
    velocity = velocity.add(
      nearAverage.sub(boid.position).normalize().scale(0.01)
    );
    boid.velocity = velocity.normalize().scale(SPEED);
  });
  const sceneHeight = Math.floor(
    (app.screen.height * SCENE_WIDTH) / data.width
  );
  boids.value.forEach((boid) => {
    boid.position = boid.position.add(boid.velocity.scale(dt));
    boid.position.x = (boid.position.x + SCENE_WIDTH) % SCENE_WIDTH;
    boid.position.y = (boid.position.y + sceneHeight) % sceneHeight;
  });
  triggerRef(boids);
});

app.stage.scale.set(data.width / SCENE_WIDTH);
app.renderer.background.color = 0xffffff;
console.log(app);
</script>
