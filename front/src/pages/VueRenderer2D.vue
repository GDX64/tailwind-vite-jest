<template>
  <div class="flex flex-col">
    <input type="color" v-model="color" class="ml-auto" />
    <input
      type="range"
      min="0"
      max="360"
      step="1"
      v-model.number="rotation"
      class="ml-auto"
    />
    <canvas ref="canvas" width="800" height="800"></canvas>
  </div>
</template>

<script setup lang="ts">
import { animationFrames } from 'rxjs';
import { ref, watchEffect, reactive } from 'vue';
import { createApp, NodeContainer, render } from '../marverick/Node2D';

import Test from '../marverick/Test.vue';

const canvas = ref<HTMLCanvasElement>();
const color = ref('#ff0000');
const rotation = ref(0);

watchEffect((clear) => {
  if (!canvas.value) {
    return;
  }
  const ctx = canvas.value.getContext('2d')!;
  const root = new NodeContainer();
  const app = createApp(Test, { myProps: reactive({ color, rotation }) });
  app.mount(root);
  animationFrames().subscribe(() => {
    if (root.needsRedraw) {
      (ctx as any).reset();
      root.draw(ctx);
    }
  });
  clear(() => app.unmount());
});
</script>
