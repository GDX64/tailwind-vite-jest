<script setup lang="ts">
import * as P from 'pixi.js';
import { onMounted, onUnmounted, ref } from 'vue';
import { fromEvent, animationFrames, merge } from 'rxjs';
import { Application } from 'pixi.js';
import {
  EulerSystem,
  add,
  scale,
  square,
  normalized,
  V2,
} from '../unitFormation/UnitFormation';
import { clamp, range } from 'ramda';

const pixi = ref<HTMLElement>();
const canvas = ref<HTMLCanvasElement>();
const maxClamp = ref(50);
const much = ref(800);
const center = ref([400, 500] as V2);
const centerInfluence = ref(0.5);
let cleanUp = () => {};
onUnmounted(() => cleanUp());
onMounted(() => {
  const app = new P.Application({
    antialias: true,
    backgroundColor: 0xffffff,
    width: window.screen.width,
    height: window.screen.height,
  });
  pixi.value!.appendChild(app.view);
  const randVar = () => Math.floor(Math.random() * 1000);
  const points = range(0, 50).map(() => [randVar(), randVar()] as V2);
  const sys = new EulerSystem(
    points,
    points.map(() => [0, 0] as V2),
    1,
    (points, speed) => {
      function influence(point: V2, ref: V2, much = 1): V2 {
        const r = add(point, scale(-1, ref));
        const acc = scale(clamp(0, maxClamp.value, much / square(r)), normalized(r));
        return acc;
      }
      function baseInfluence(point: V2, ref: V2): V2 {
        const r = add(point, scale(-1, ref));
        const acc = scale(-centerInfluence.value, normalized(r));
        return acc;
      }
      return points.map((point, index) => {
        const base = add(scale(-0.1, speed[index]), baseInfluence(point, center.value));
        const otherPoints = points.filter((other) => other !== point);
        return otherPoints.reduce(
          (acc, p) => add(acc, influence(point, p, much.value)),
          base
        );
      });
    }
  );
  const balls = sys.points.map(() => new Ball(app));
  const animation = animationFrames().subscribe(() => {
    sys.evolve().points.forEach((point, index) => {
      balls[index].graphics.x = point[0];
      balls[index].graphics.y = point[1];
    });
  });
  const sub = merge(
    fromEvent<MouseEvent>(app.view, 'mousemove'),
    fromEvent<TouchEvent>(app.view, 'touchmove')
  ).subscribe((mouseOrTouch) => {
    if (mouseOrTouch instanceof TouchEvent) {
      const touch = mouseOrTouch.touches[0];
      center.value = [touch.clientX, touch.clientY];
    } else {
      center.value = [mouseOrTouch.clientX, mouseOrTouch.clientY];
    }
  });
  cleanUp = () => {
    sub.unsubscribe();
    animation.unsubscribe();
    app.destroy(true, { children: true });
  };
});

class Ball {
  graphics;
  constructor(public app: Application) {
    const graphics = new P.Graphics();
    // Rectangle
    graphics.beginFill(0x222222);
    graphics.lineStyle(1, 0xf05555, 1);
    graphics.drawCircle(0, 0, 8);
    graphics.endFill();
    app.stage.addChild(graphics);
    this.graphics = graphics;
  }
}
</script>

<template>
  <div class="fixed w-screen h-screen">
    <div class="inputs flex flex-wrap absolute top-0 left-0">
      <div class="flex">
        <label for="" class="w-36">max repulsion: {{ maxClamp }}</label>
        <input type="range" min="0" max="500" step="1" v-model="maxClamp" />
      </div>
      <div class="flex">
        <label for="" class="w-36">repulsion: {{ much }}</label>
        <input type="range" min="0" max="1000" step="1" v-model="much" />
      </div>
      <div class="flex">
        <label for="" class="w-36">center froce: {{ centerInfluence }}</label>
        <input type="range" min="0" max="3" step="0.01" v-model="centerInfluence" />
      </div>
    </div>
    <div class="" ref="pixi"></div>
    <slot></slot>
  </div>
</template>

<style></style>
