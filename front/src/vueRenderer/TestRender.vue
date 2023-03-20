<template>
  <rect
    :w="drawData.width - 4"
    :h="drawData.height - 4"
    :x="2"
    :y="2"
    :fillOpacity="0.1"
    fill="yellow"
    fillStyle="solid"
  >
  </rect>
  <GScale
    :x="{ domain: [-10, 10], image: [10, drawData.width - 10] }"
    :y="{ domain: [-10, 10], image: [drawData.height - 10, 10] }"
    :ticks="5"
    :nDomain="30"
  >
    <template #default="{ scaleXY, arrDomain }">
      <rect
        v-for="x of arrDomain"
        :x="scaleXY.x(x)"
        :w="5"
        :h="5"
        :y="scaleXY.y(sinFunc(x))"
        :fill="'red'"
        :centerPivot="true"
      ></rect>
      <gline
        :curve="true"
        :roughness="1"
        :points="arrDomain.map((x) => [x, sinFunc(x)])"
        :scaleXY="scaleXY"
      ></gline>
    </template>
  </GScale>
</template>

<script setup lang="ts">
import { Subject } from 'rxjs';
import { watchEffect } from 'vue';
import { useDrag, useElapsed } from '../utils/rxjsUtils';
import Arrow from './Arrow.vue';
import GScale from './GScale.vue';
import { useDrawData } from './UseDraw';

const { props } = defineProps<{ props: { range: number } }>();

const drawData = useDrawData();
const clickObs = new Subject<void>();
const pos = useDrag(clickObs);
function onMouseDown() {
  console.log('dow there');
  clickObs.next();
}

function sinFunc(x: number) {
  return Math.sin(x + time.value / 1000) * 5;
}
const time = useElapsed();
</script>
