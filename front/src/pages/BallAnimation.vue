<script setup lang="ts">
import * as P from 'pixi.js';
import { onMounted, ref, watchEffect } from 'vue';
import { animate } from 'popmotion';
import { zip, fromEvent, Observable, switchMap } from 'rxjs';
import { Application } from 'pixi.js';

const pixi = ref<HTMLElement>();
const stiffness = ref(250);
const damping = ref(20);
onMounted(() => {
  const app = new P.Application({ antialias: true, backgroundColor: 0xffffff });
  pixi.value!.appendChild(app.view);
  new Ball(app);
});

class Ball {
  constructor(app: Application) {
    const graphics = new P.Graphics();
    // Rectangle
    graphics.beginFill(0x26306b);
    graphics.lineStyle(2, 0xfeeb77, 1);
    graphics.drawCircle(0, 0, 50);
    graphics.endFill();
    fromEvent<MouseEvent>(app.view, 'mousedown')
      .pipe(
        switchMap((down) => {
          return zip([
            springAnimation(graphics.x, down.offsetX),
            springAnimation(graphics.y, down.offsetY),
          ]);
        })
      )
      .subscribe(([x, y]) => {
        graphics.x = x;
        graphics.y = y;
      });
    app.stage.addChild(graphics);
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
    <div class="" ref="pixi"></div>
    <slot></slot>
  </div>
</template>

<style>
.fake-bg {
  z-index: -1;
}
</style>
