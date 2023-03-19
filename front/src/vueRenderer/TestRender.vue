<template>
  <rect
    v-for="[x, y, rate] of arrows"
    :x="x"
    :w="20"
    :h="20"
    :y="250 + Math.sin(time / rate / 1000) * 200"
    :fill="'red'"
  ></rect>
</template>

<script setup lang="ts">
import { fromEvent, scan, Subject, switchMap, takeUntil } from 'rxjs';
import { ref, onUnmounted, h } from 'vue';
import { useDrag, useElapsed } from '../utils/rxjsUtils';
import { range } from 'ramda';
import Arrow from './Arrow.vue';

const { props } = defineProps<{ props: { range: number } }>();
const arrows = range(0, 1000).map(() => [
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
