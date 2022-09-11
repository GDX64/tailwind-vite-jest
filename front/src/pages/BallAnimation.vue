<script setup lang="ts">
import * as P from 'pixi.js';
import { onMounted, ref, watchEffect } from 'vue';
import { animate } from 'popmotion';
import { zip, fromEvent, Observable, switchMap, animationFrames } from 'rxjs';
import { Application, Point } from 'pixi.js';
import {
  RK4Order2,
  EulerOrder2,
  EulerSystem,
  add,
  scale,
  square,
  normalized,
  norm,
  V2,
} from '../unitFormation/UnitFormation';
import { Chart, registerables } from 'chart.js';
import { clamp, range, values } from 'ramda';
Chart.register(...registerables);
const pixi = ref<HTMLElement>();
const canvas = ref<HTMLCanvasElement>();
const stiffness = ref(250);
const damping = ref(20);
const maxClamp = ref(50);
const much = ref(800);
const center = ref([400, 500] as V2);
const centerInfluence = ref(0.5);
onMounted(() => {
  const app = new P.Application({
    antialias: true,
    backgroundColor: 0xffffff,
    width: 1000,
    height: 800,
  });
  pixi.value!.appendChild(app.view);
  const randVar = () => Math.floor(Math.random() * 1000);
  const points = range(0, 15).map(() => [randVar(), randVar()] as V2);
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
  const valuesSys = [] as any[];
  const first = valuesSys.map((v) => ({ x: v.t, y: v.points[0][0], acc: v.acc[0] }));
  const second = valuesSys.map((v) => ({ x: v.t, y: v.points[1][0] }));
  const balls = sys.points.map(() => new Ball(app));
  animationFrames().subscribe(() => {
    sys.evolve().points.forEach((point, index) => {
      balls[index].graphics.x = point[0];
      balls[index].graphics.y = point[1];
    });
  });
  fromEvent<MouseEvent>(app.view, 'mousedown').subscribe((event) => {
    center.value = [event.offsetX, event.offsetY];
  });
});

function rk4Chart(canvas: HTMLCanvasElement) {
  const dt = 1;
  const N = 500;
  const rk4 = new RK4Order2(100, 0, dt, 0, (_, x) => -x);
  const euler = new EulerOrder2(100, 0, dt, 0, (_, x) => -x);
  const valuesRk4 = range(0, N).map(() => {
    const { x, t } = rk4.evolve();
    return { x: t, y: x };
  });
  const valuesEuler = range(0, N).map(() => {
    const { x, t } = euler.evolve();
    return { x: t, y: x };
  });
  const c = new Chart(canvas, {
    data: {
      datasets: [
        {
          label: 'RK4',
          borderColor: 'rgb(255, 193, 99)',
          data: valuesRk4,
          showLine: true,
        },
        {
          label: 'EULER',
          borderColor: 'rgb(54, 117, 199)',
          data: valuesEuler,
          showLine: true,
        },
      ],
    },
    type: 'scatter',
    options: {},
  });
}

class Ball {
  graphics;
  constructor(public app: Application) {
    const graphics = new P.Graphics();
    // Rectangle
    graphics.beginFill(0x26306b);
    graphics.lineStyle(2, 0xfeeb77, 1);
    graphics.drawCircle(0, 0, 10);
    graphics.endFill();
    app.stage.addChild(graphics);
    this.graphics = graphics;
  }

  mouseClick() {
    fromEvent<MouseEvent>(this.app.view, 'mousedown')
      .pipe(
        switchMap((down) => {
          return zip([
            springAnimation(this.graphics.x, down.offsetX),
            springAnimation(this.graphics.y, down.offsetY),
          ]);
        })
      )
      .subscribe(([x, y]) => {
        this.graphics.x = x;
        this.graphics.y = y;
      });
  }
}

type Point = [number, number];

function springAnimation(from: number, to: number) {
  return new Observable<number>((sub) => {
    const stop = animate({
      from,
      to,
      stiffness: stiffness.value,
      damping: damping.value,
      type: 'spring',
      onUpdate: (value) => sub.next(value),
      onComplete: () => sub.complete(),
    });
    return () => stop.stop();
  });
}
</script>

<template>
  <div class="fake-bg fixed w-screen h-screen">
    <div class="inputs flex">
      <div class="flex">
        <label for="">stiffness</label>
        <input type="range" min="0" max="500" step="1" v-model="stiffness" />
      </div>
      <div class="flex">
        <label for="">damping</label>
        <input type="range" min="0" max="50" step="1" v-model="damping" />
      </div>
      <div class="flex">
        <label for="" class="w-20">max: {{ maxClamp }}</label>
        <input type="range" min="0" max="500" step="1" v-model="maxClamp" />
      </div>
      <div class="flex">
        <label for="" class="w-20">much: {{ much }}</label>
        <input type="range" min="0" max="1000" step="1" v-model="much" />
      </div>
      <div class="flex">
        <label for="" class="w-24">center: {{ centerInfluence }}</label>
        <input type="range" min="0" max="3" step="0.01" v-model="centerInfluence" />
      </div>
    </div>
    <canvas ref="canvas"></canvas>
    <div class="" ref="pixi"></div>
    <slot></slot>
  </div>
</template>

<style>
.fake-bg {
  z-index: -1;
}
</style>
