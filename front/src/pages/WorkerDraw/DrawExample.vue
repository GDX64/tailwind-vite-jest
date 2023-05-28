<template>
  <pcontainer>
    <PixiSquare
      :cacheAsBitmap="true"
      :height="20"
      :width="20"
      v-for="{ x, y, index } of squaresPos"
      :key="index"
      :x="x"
      :y="y"
      fill="#ff0000"
    />
    <ptext :text="drawData.app?.ticker.FPS.toFixed(2)"></ptext>
  </pcontainer>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useAnimation, useElapsed } from '../../utils/rxjsUtils';
import PixiSquare from '../../vueRenderer/BaseComponents/PixiSquare.vue';
import { useDrawData } from '../../vueRenderer/UseDraw';

const props = defineProps<{ squares: number }>();
const time = useElapsed();
const drawData = useDrawData();
const squaresPos = computed(() => {
  return [...Array(props.squares)].map((_, index) => {
    return reactive({
      index,
      x: Math.random() * drawData.width,
      y: Math.random() * drawData.height,
      vx: Math.random() * 100,
      vy: Math.random() * 100,
    });
  });
});
useAnimation((ticker) => {
  const dt = ticker.deltaMS / 1000;
  squaresPos.value.forEach((square) => {
    if (square.x > drawData.width) {
      square.vx *= -1;
      square.x = drawData.width;
    }
    if (square.x < 0) {
      square.vx *= -1;
      square.x = 0;
    }
    if (square.y < 0) {
      square.vy *= -1;
      square.y = 0;
    }
    if (square.y > drawData.height) {
      square.vy *= -1;
      square.y = drawData.height;
    }
    square.x += square.vx * dt;
    square.y += square.vy * dt;
  });
});
</script>
