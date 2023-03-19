<template>
  <rect :x="pos[0]" :y="pos[1]" :w="200" @mousedown="onMouseDown" fill="green"></rect>
  <gline :curve="true" :points="[[0, 100], [100, 50], [200, 200], pos]"></gline>
  <Arrow :to="pos" :from="[200, 200]"></Arrow>
</template>

<script setup lang="ts">
import { fromEvent, scan, Subject, switchMap, takeUntil } from 'rxjs';
import { ref, onUnmounted, h } from 'vue';
import { useDrag } from '../utils/rxjsUtils';
import Arrow from './Arrow.vue';

const { props } = defineProps<{ props: { range: number } }>();

const clickObs = new Subject<void>();
const pos = useDrag(clickObs);
function onMouseDown() {
  console.log('dow there');
  clickObs.next();
}
</script>
