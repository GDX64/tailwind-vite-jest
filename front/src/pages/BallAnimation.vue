<script setup lang="ts">
import * as P from 'pixi.js';
import { onMounted, ref, watchEffect } from 'vue';
import { animate } from 'popmotion';
import { zip, fromEvent, Observable, switchMap, animationFrames } from 'rxjs';
import { Application } from 'pixi.js';
import { RK4Order2, EulerOrder2 } from '../unitFormation/UnitFormation';
import { Chart, registerables } from 'chart.js';
import { range } from 'ramda';
Chart.register(...registerables);
const pixi = ref<HTMLElement>();
const canvas = ref<HTMLCanvasElement>();
const stiffness = ref(250);
const damping = ref(20);
onMounted(() => {
  // const app = new P.Application({ antialias: true, backgroundColor: 0xffffff });
  // pixi.value!.appendChild(app.view);
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
  const c = new Chart(canvas.value!, {
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
});

class Ball {
  graphics;
  constructor(public app: Application) {
    const graphics = new P.Graphics();
    // Rectangle
    graphics.beginFill(0x26306b);
    graphics.lineStyle(2, 0xfeeb77, 1);
    graphics.drawCircle(0, 0, 50);
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
    <div class="flex">
      <label for="">stiffness</label>
      <input type="range" min="0" max="500" step="1" v-model="stiffness" />
    </div>
    <div class="flex">
      <label for="">damping</label>
      <input type="range" min="0" max="50" step="1" v-model="damping" />
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
