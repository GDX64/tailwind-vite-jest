<template>
  <GScale
    :x="{ domain: [-10, 10], image: [0, 700] }"
    :y="{ domain: [-10, 10], image: [500, 0] }"
    :ticks="5"
    :nDomain="30"
  >
    <template #default="{ scaleXY, arrDomain }">
      <rect
        v-for="x of arrDomain"
        :x="scaleXY.x(x)"
        :w="5"
        :h="5"
        :y="scaleXY.y(Math.sin(x + time / 1000) * 5)"
        :fill="'red'"
      ></rect>
      <gline
        :curve="true"
        :roughness="1"
        :points="arrDomain.map((x) => [x, Math.sin(x + time / 1000) * 5])"
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

const clickObs = new Subject<void>();
const pos = useDrag(clickObs);
function onMouseDown() {
  console.log('dow there');
  clickObs.next();
}
const time = useElapsed();
</script>
