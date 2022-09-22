<script setup lang="ts">
import * as P from 'pixi.js';
import { onMounted, ref, watchEffect } from 'vue';
import { fromEvent, animationFrames, merge } from 'rxjs';
import { Application } from 'pixi.js';
import {
  EulerSystem,
  add,
  scale,
  square,
  normalized,
  V2,
  norm,
} from '../unitFormation/UnitFormation';
import { clamp, range, splitEvery } from 'ramda';
import init, { random_world } from 'rust';

const pixi = ref<HTMLElement>();
const maxClamp = ref(10);
const much = ref(800);
const center = ref([400, 500] as V2);
const centerForce = ref(1.5);
const repulsion = ref(100);
const particles = ref(200);
const ready = ref(false);

onMounted(async () => {
  await init();
  ready.value = true;
});

watchEffect((clear) => {
  clear(createBallApp());
});

function createBallApp() {
  if (!pixi.value || !ready.value) {
    return () => {};
  }
  const app = new P.Application({
    antialias: true,
    backgroundColor: 0xffffff,
    width: window.screen.width,
    height: window.screen.height,
  });
  pixi.value.appendChild(app.view);

  const sys = eulerWasm();
  const balls = sys.points.map(() => new Ball(app));
  const animation = animationFrames().subscribe(() => {
    const points = sys.evolve().points;
    const v = sys.v;
    points.forEach((point, index) => {
      balls[index].graphics.x = point[0];
      balls[index].graphics.y = point[1];
      balls[index].graphics.alpha = norm(v[index]) / 10 + 0.2;
    });
  });
  const sub = merge(
    fromEvent<MouseEvent>(app.view, 'mousemove'),
    fromEvent<TouchEvent>(app.view, 'touchmove')
  ).subscribe((mouseOrTouch) => {
    if (mouseOrTouch instanceof TouchEvent) {
      const touch = mouseOrTouch.touches[0];
      sys.setCenter([touch.clientX, touch.clientY]);
    } else {
      sys.setCenter([mouseOrTouch.clientX, mouseOrTouch.clientY]);
    }
  });
  const stop = watchEffect(() => {
    sys.setForces(repulsion.value, centerForce.value);
  });
  return () => {
    sub.unsubscribe();
    animation.unsubscribe();
    app.destroy(true, true);
    sys.destroy();
    stop();
  };
}

function eulerWasm() {
  const world = random_world(500, 500, particles.value);
  return {
    evolve() {
      world.evolve();
      return this;
    },
    get points(): V2[] {
      const points = world.points();
      return splitEvery(2, [...points]) as V2[];
    },
    get v(): V2[] {
      const points = world.speed();
      return splitEvery(2, [...points]) as V2[];
    },
    destroy() {
      world.free();
    },
    setCenter([x, y]: V2) {
      world.set_center(x, y);
    },
    setForces(repulsion: number, center: number) {
      world.set_forces(repulsion, center);
    },
  };
}

function makeEulerSys() {
  const randVar = () => Math.floor(Math.random() * 1000);
  const points = range(0, particles.value).map(() => [randVar(), randVar()] as V2);
  return new EulerSystem(
    points,
    points.map(() => [0, 0] as V2),
    1,
    (points, speed) => {
      function influence(point: V2, reference: V2, much = 1): V2 {
        const r = add(point, scale(-1, reference));
        const acc = scale(clamp(0, maxClamp.value, much / square(r)), normalized(r));
        return acc;
      }
      function baseInfluence(point: V2, reference: V2): V2 {
        const r = add(point, scale(-1, reference));
        const acc = scale(-centerForce.value * Math.min(norm(r), 1), normalized(r));
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
}

class Ball {
  graphics;
  constructor(public app: Application) {
    const graphics = new P.Graphics();
    // Rectangle
    app.stage.addChild(graphics);
    this.graphics = graphics;
    this.graphics.clear();
    this.graphics.beginFill(0x222222);
    this.graphics.lineStyle(1, 0x000000, 1);
    this.graphics.drawCircle(0, 0, 8);
    this.graphics.endFill();
  }
}
</script>

<template>
  <div class="fixed w-screen h-screen">
    <div class="inputs flex flex-wrap absolute top-0 left-0 items-center">
      <div class="">
        <label for="">particles</label
        ><input type="number" v-model="particles" class="w-20" />
      </div>
      <div class="">
        <label for="">force</label
        ><input
          type="range"
          min="40"
          max="1000"
          step="1"
          v-model="repulsion"
          class="w-20"
        />
      </div>
      <div class="">
        <label for="">center</label
        ><input
          type="range"
          min="0.5"
          max="10"
          step="0.1"
          v-model="centerForce"
          class="w-20"
        />
      </div>
    </div>
    <div class="" ref="pixi"></div>
    <slot></slot>
  </div>
</template>

<style></style>
