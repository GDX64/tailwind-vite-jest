<template>
  <div class="flex flex-col">
    <input
      type="color"
      class="ml-auto"
      @input="color.set(($event.target as any).value)"
    />
    <input
      type="range"
      min="0"
      max="360"
      step="1"
      class="ml-auto"
      @input="rotation.set(Number(($event.target as any).value))"
    />
    <canvas ref="canvas" width="800" height="800"></canvas>
  </div>
</template>

<script setup lang="ts">
import { animationFrames } from 'rxjs';
import { ref, watchEffect, reactive } from 'vue';
import { CNode } from '../marverick/CNode';
import { signal, effect } from '@maverick-js/signals';

const canvas = ref<HTMLCanvasElement>();
const color = signal('#ff0000');
const rotation = signal(0);
watchEffect((clear) => {
  if (!canvas.value) {
    return;
  }
  const ctx = canvas.value.getContext('2d')!;
  const root = new CNode().addChild(() => {
    return (
      new CNode((ctx) => {
        ctx.fillStyle = color();
        ctx.fillRect(0, 0, 100, 100);
      })
        // .setTransform(() => new DOMMatrix().translate(rotation()))
        .addChild(() => {
          if (rotation() > 90) {
            return new CNode();
          }
          return new CNode((ctx) => {
            ctx.fillStyle = '#000000';
            ctx.fillRect(10, 10, 30, 30);
          }).setTransform(() => new DOMMatrix().translate(rotation()));
        })
    );
  });

  effect(() => {
    // console.log('run', color());
    (ctx as any).reset();
    root.draw(ctx);
  });
});
</script>
