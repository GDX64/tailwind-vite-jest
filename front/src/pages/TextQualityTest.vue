<template>
  <div class="w-screen h-screen flex flex-col">
    <div class="select-none">text: {{ amountOfText }} // Fps: {{ fps }}</div>
    <select v-model="textOption" class="w-fit bg-gray-400">
      <option :value="TextOptions.canvas2D">canvas2d</option>
      <option :value="TextOptions.pixijs">pixi</option>
    </select>

    <TextCanvas
      v-if="textOption === TextOptions.canvas2D"
      :amount-of-text="amountOfText"
    ></TextCanvas>
    <TextPixi v-if="textOption === TextOptions.pixijs" :amount-of-text="amountOfText" />
  </div>
</template>

<script setup lang="ts">
import { ReactiveEffect, computed, ref } from 'vue';
import { useAnimationFrames } from '../utils/rxjsUtils';
import TextCanvas from './textRendering/TextCanvas.vue';
import TextPixi from './textRendering/TextPixi.vue';
enum TextOptions {
  canvas2D,
  pixijs,
}

const fps = ref(0);
const effect = new ReactiveEffect(
  () => fps.value,
  () => {
    console.log('scheduler was called');
  }
);
effect.run();
useAnimationFrames(({ delta, count }) => {
  if (count % 60 === 0) {
    fps.value = Math.round(1000 / delta);
  }
});
const amountOfText = ref(500);
const textOption = ref(TextOptions.pixijs);
</script>
