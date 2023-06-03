<template>
  <GStage class="w-full aspect-square" :draw-data="drawData">
    <template #default>
      <GScale :x-data="scaleParams.x" :y-data="scaleParams.y">
        <PixiLines :points="points"
      /></GScale>
      <PixiSquare
        @pointerdown="pointerDown$.next($event)"
        @mousedown="pointerDown$.next($event)"
        @touchstart="pointerDown$.next($event)"
        :width="50"
        :height="50"
        fill="#ff0000"
      ></PixiSquare>
    </template>
  </GStage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import PixiLines from '../../vueRenderer/BaseComponents/PixiLines.vue';
import GScale from '../../vueRenderer/GScale.vue';
import GStage from '../../vueRenderer/GStage.vue';
import { useDrawData } from '../../vueRenderer/UseDraw';
import PixiSquare from '../../vueRenderer/BaseComponents/PixiSquare.vue';
import { Subject } from 'rxjs';

const ySampled = ref([] as number[]);

const pointerDown$ = new Subject<PointerEvent>();
pointerDown$.subscribe(console.log);

const drawData = useDrawData();

const scaleParams = computed(() => {
  return {
    x: { padding: 10, domain: [-1, 10] as const },
    y: {
      domain: [0, drawData.height] as const,
      image: [drawData.height - 10, 10] as const,
    },
  };
});

const points = computed(() => {
  return ySampled.value.map((y, index) => [index, y] as [number, number]);
});
</script>
