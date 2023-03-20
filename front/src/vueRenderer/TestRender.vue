<template>
  <rect
    v-for="[x, y, rate] of arrows"
    :x="x"
    :w="20"
    :h="20"
    :y="250 + Math.sin(time / rate / 1000) * 200"
    :fill="'red'"
  ></rect>
  <GScale
    :x="{ domain: [-10, 10], image: [0, 500] }"
    :y="{ domain: [-10, 10], image: [500, 0] }"
    :ticks="5"
  >
    <template #default="{ scaleXY }">
      <gline
        :points="[
          [1, 1],
          [2, 1],
          [3, -3],
        ]"
        :scaleXY="scaleXY"
      ></gline>
    </template>
  </GScale>
</template>

<script setup lang="ts">
import { fromEvent, scan, Subject, switchMap, takeUntil } from 'rxjs';
import { ref, onUnmounted, h } from 'vue';
import { useDrag, useElapsed } from '../utils/rxjsUtils';
import { range } from 'ramda';
import Arrow from './Arrow.vue';
import GScale from './GScale.vue';

const { props } = defineProps<{ props: { range: number } }>();
const arrows = range(0, 10).map(() => [
  Math.random() * 500,
  Math.random() * 500,
  Math.random() * 2 + 1,
]);
const clickObs = new Subject<void>();
const pos = useDrag(clickObs);
function onMouseDown() {
  console.log('dow there');
  clickObs.next();
}
const time = useElapsed();
</script>
