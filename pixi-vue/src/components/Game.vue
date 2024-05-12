<template>
  <g-container v-if="texture">
    <g-sprite
      v-for="[key, boid] in boids.boids"
      @pointerdown="onBoidClick"
      :x="boid.position.x"
      :y="boid.position.y"
      :rotation="boid.rotation + Math.PI / 2"
      :texture="texture"
      :width="1.5"
      :height="texture.height / texture.width"
      :key="key"
      :elKey="key"
    ></g-sprite>
    <g-graphics
      v-if="selectedPosition"
      :x="selectedPosition.x"
      :y="selectedPosition.y"
      :drawfn="graphicsDraw"
    ></g-graphics>
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
import { BoidsWorld, Boid } from "./BoidsWorld";
import { GElement, ELKey } from "../renderer/Elements";
import { FederatedEvent, GraphicsContext } from "pixi.js";
import { computed } from "vue";

const SCENE_WIDTH = 50;

const texture = shallowRef<Texture>();
Assets.load([baseSpritePath]).then(() => {
  texture.value = Texture.from(baseSpritePath);
});

const boids = shallowRef<BoidsWorld>(new BoidsWorld());
const selectedKey = shallowRef<ELKey | null>(null);
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

const selectedPosition = computed(() => {
  const selected = boids.value.findWithID(selectedKey.value);
  if (!selected) return;
  return selected.position;
});

function onBoidClick(_event: FederatedEvent, el: GElement) {
  selectedKey.value = el.elKey;
}

const graphicsDraw = computed(() => {
  return (ctx: GraphicsContext) => {
    ctx
      .circle(0, 0, BoidsWorld.TOO_CLOSE)
      .stroke({ width: 0.1, color: 0xff0000 });
    ctx.circle(0, 0, BoidsWorld.NEAR).stroke({ width: 0.1, color: 0xffff00 });
  };
});
</script>
