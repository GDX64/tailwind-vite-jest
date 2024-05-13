<template>
  <g-container v-if="texture">
    <!-- <g-sprite
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
      ></g-sprite> -->

    <g-animated-sprite
      v-if="animatedTextures.length > 0"
      v-for="[key, boid] in boids.boids"
      @pointerdown="onBoidClick"
      :textures="animatedTextures"
      :x="boid.position.x"
      :y="boid.position.y"
      :width="10"
      :height="10"
      :originX="animatedTextures[0].width / 2"
      :originY="animatedTextures[0].height / 2"
      :frameOffset="key"
      :key="key"
      :elKey="key"
    ></g-animated-sprite>

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
import birdsPng from "../assets/birds.png";
import { BoidsWorld, Boid } from "./BoidsWorld";
import { GElement, ELKey } from "../renderer/Elements";
import {
  FederatedEvent,
  GraphicsContext,
  Spritesheet,
  AnimatedSprite,
} from "pixi.js";
import { computed } from "vue";

const SCENE_WIDTH = 50;

const animatedTextures = shallowRef<Texture[]>([]);
const texture = shallowRef<Texture>();

Assets.load([baseSpritePath, birdsPng]).then(async () => {
  texture.value = Texture.from(baseSpritePath);
  const birdTexture = Texture.from(birdsPng);
  const birdSize = 920 / 5;
  const spriteSheet = new Spritesheet(birdTexture, {
    frames: {
      bird1: {
        frame: { x: 0, y: 0, w: birdSize, h: birdSize },
      },
      bird2: {
        frame: { x: birdSize, y: 0, w: birdSize, h: birdSize },
      },
      bird3: {
        frame: { x: birdSize * 2, y: 0, w: birdSize, h: birdSize },
      },
      bird4: {
        frame: { x: birdSize * 3, y: 0, w: birdSize, h: birdSize },
      },
      bird5: {
        frame: { x: birdSize * 4, y: 0, w: birdSize, h: birdSize },
      },
    },
    meta: {
      image: birdsPng,
      format: "RGBA8888",
      size: { w: 920, h: 920 },
      scale: 1,
    },
    animations: {
      bird: [
        "bird1",
        "bird2",
        "bird3",
        "bird4",
        "bird5",
        "bird4",
        "bird3",
        "bird2",
      ],
    },
  });
  await spriteSheet.parse();
  animatedTextures.value = spriteSheet.animations.bird;
  // texture.value = spriteSheet.animations;
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
const sceneArea = SCENE_WIDTH * sceneHeight;
const boidCount = Math.floor(sceneArea / (BoidsWorld.NEAR / 2) ** 2);
boids.value.create(boidCount);

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
