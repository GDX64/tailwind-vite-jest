<template>
  <g-container>
    <g-raw :pixiEl="tile" v-if="tile"></g-raw>

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
      :width="BoidsWorld.BOID_SIZE * 2"
      :height="BoidsWorld.BOID_SIZE * 2"
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
import birdsPng from "../assets/birds.png";
import skyPng from "../assets/sky.png";
import { BoidsWorld } from "./BoidsWorld";
import { GElement, ELKey } from "../renderer/Elements";
import {
  FederatedEvent,
  GraphicsContext,
  Spritesheet,
  TilingSprite,
} from "pixi.js";
import { computed } from "vue";
import { watch } from "vue";

const animatedTextures = shallowRef<Texture[]>([]);
const tile = shallowRef<TilingSprite | null>(null);

Assets.load([skyPng, birdsPng]).then(async () => {
  const birdTexture = Texture.from(birdsPng);
  const skyTexture = Texture.from(skyPng);
  tile.value = new TilingSprite({
    texture: skyTexture,
  });

  tile.value.width = boids.value.sceneWidth;
  tile.value.height = boids.value.sceneHeight;
  tile.value.tileScale.set(1 / 2);

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

usePixiAnimation((ticker) => {
  boids.value.update();
  triggerRef(boids);
  if (tile.value) {
    tile.value.tilePosition.x += ticker.deltaMS / 100;
  }
});

app.renderer.background.color = 0xffffff;

watch(
  () => [data.width, data.height] as const,
  () => {
    boids.value.sceneWidth = data.width;
    boids.value.sceneHeight = data.height;
    const sceneArea = data.width * data.height;
    const boidCount = Math.floor(sceneArea / BoidsWorld.BOID_SIZE ** 2 / 8);
    boids.value.create(boidCount);
    if (tile.value) {
      tile.value.width = data.width;
      tile.value.height = data.height;
    }
  },
  { immediate: true }
);

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
      .stroke({ width: 1, color: 0xff0000 });
    ctx.circle(0, 0, BoidsWorld.NEAR).stroke({ width: 1, color: 0xffff00 });
  };
});
</script>
