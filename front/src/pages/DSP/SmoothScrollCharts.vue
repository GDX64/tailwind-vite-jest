<template>
  <GScale :x-data="scaleParams.x" :y-data="scaleParams.ySpeed" no-lines>
    <template #default="{ ticks, scaleXY }">
      <ptext
        :text="tick.toFixed(0)"
        v-for="tick of ticks.y"
        :y="scaleXY.y(tick)"
        :x="scaleXY.x(maxSamples) - 20"
        :ref="speedScale"
      ></ptext>
      <PixiLines :points="indexedPoints(speed)" stroke="#ff0000" />
    </template>
  </GScale>
  <GScale :x-data="scaleParams.x" :y-data="scaleParams.yPos">
    <template #default="{ ticks, scaleXY }">
      <ptext
        :text="tick.toFixed(0)"
        v-for="tick of ticks.y"
        :y="scaleXY.y(tick)"
        :x="scaleXY.x(0) + 5"
        :ref="blackScale"
      ></ptext>
      <PixiLines :points="indexedPoints(points)" />
    </template>
  </GScale>
  <PixiSquare
    @pointerdown="pointerDown$.next($event)"
    :width="squareSize"
    :height="squareSize"
    :x="pos[0]"
    :y="3"
    fill="#ff0000"
  ></PixiSquare>
</template>

<script setup lang="ts">
import { computed, onUpdated, ref, watchEffect } from 'vue';
import PixiLines from '../../vueRenderer/BaseComponents/PixiLines.vue';
import GScale from '../../vueRenderer/GScale.vue';
import { useDrawData } from '../../vueRenderer/UseDraw';
import PixiSquare from '../../vueRenderer/BaseComponents/PixiSquare.vue';
import { Subject } from 'rxjs';
import { FederatedPointerEvent, Text } from 'pixi.js';
import { useAnimation, useDrag } from '../../utils/rxjsUtils';
import { DragSquare, EstimatorConstructor } from './DSPMovement';

const props = defineProps<{
  estimatorConst?: EstimatorConstructor;
}>();
const drawData = useDrawData();
const squareSize = 30;
const maxSamples = 120;
const estimator = computed(() => {
  if (props.estimatorConst) {
    return new DragSquare(props.estimatorConst, drawData.width - squareSize);
  }
});

const points = ref([] as number[]);
const pointerDown$ = new Subject<FederatedPointerEvent>();
const { pos, isDragging } = useDrag(pointerDown$);
const speed = ref([] as number[]);
const maxEverSpeed = ref(5);

useAnimation((ticker) => {
  if (!estimator.value) return;
  if (isDragging.value) {
    estimator.value.drag(pos.value[0], ticker.deltaMS);
  } else {
    estimator.value.onTick(ticker.deltaMS);
  }
  pos.value[0] = estimator.value.position;
  maxEverSpeed.value = Math.max(maxEverSpeed.value, Math.abs(estimator.value.getSpeed()));
  speed.value.push(estimator.value.getSpeed());
  points.value.push(pos.value[0]);
  if (points.value.length > maxSamples) {
    speed.value.shift();
    points.value.shift();
  }
});

function indexedPoints(x: number[]) {
  return function* () {
    const N = x.length;
    for (let i = 0; i < N; i++) {
      yield [i, x[i]] as [number, number];
    }
  };
}

const scaleParams = computed(() => {
  return {
    x: { padding: 10, domain: [-5, maxSamples] as const },
    yPos: {
      domain: [-drawData.height, drawData.height] as const,
      image: [drawData.height - 10, 10] as const,
    },
    ySpeed: {
      domain: [-maxEverSpeed.value, maxEverSpeed.value] as const,
      image: [drawData.height - 10, 10] as const,
    },
  };
});

function blackScale(_text: any) {
  if (!_text) return;
  const text = _text as Text;
  text.style.fontSize = 12;
  text.style.textBaseline = 'bottom';
}
function speedScale(_text: any) {
  if (!_text) return;
  const text = _text as Text;
  text.style.fontSize = 12;
  text.style.align = 'right';
  text.style.stroke = '#ff0000';
  text.style.fill = '#ff0000';
}
</script>
