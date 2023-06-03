<template>
  <GScale :x-data="scaleParams.x" :y-data="scaleParams.y">
    <PixiLines :points="indexedPoints(points)" />
    <PixiLines :points="estimatedSpeed" stroke="#ff0000" />
  </GScale>
  <PixiSquare
    @pointerdown="pointerDown$.next($event)"
    :width="50"
    :height="50"
    :x="pos[0]"
    fill="#ff0000"
  ></PixiSquare>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import PixiLines from '../../vueRenderer/BaseComponents/PixiLines.vue';
import GScale from '../../vueRenderer/GScale.vue';
import { useDrawData } from '../../vueRenderer/UseDraw';
import PixiSquare from '../../vueRenderer/BaseComponents/PixiSquare.vue';
import { Subject } from 'rxjs';
import { FederatedPointerEvent } from 'pixi.js';
import { useAnimation, useDrag } from '../../utils/rxjsUtils';

const points = ref([] as number[]);

const pointerDown$ = new Subject<FederatedPointerEvent>();

const { pos, isDragging } = useDrag(pointerDown$);
const speed = ref([] as number[]);

const drawData = useDrawData();
useAnimation((ticker) => {
  if (isDragging.value) {
    points.value.push(pos.value[0]);
    points.value = points.value.slice(-60);
    speed.value.push(differentiateSignal(points.value, speed.value));
    speed.value = speed.value.slice(-60);
  }
});

const estimatedSpeed = computed(() => {
  return indexedPoints(speed.value);
});

function indexedPoints(x: number[]) {
  return x.map((x, i) => [i, x] as [number, number]);
}

function differentiateSignal(position: number[], speed: number[]): number {
  const b = [0.1];
  const a = [0.9];
  const i = position.length - 1;
  let result = 0;
  b.forEach((coef, coefIndex) => {
    result += coef * (position[i - coefIndex] ?? 0);
  });
  a.forEach((coef, coefIndex) => {
    result += coef * (speed[i - coefIndex] ?? 0);
  });
  return result;
}

const scaleParams = computed(() => {
  return {
    x: { padding: 10, domain: [-5, 60] as const },
    y: {
      domain: [-drawData.height, drawData.height] as const,
      image: [drawData.height - 10, 10] as const,
    },
  };
});
</script>
