<template>
  <scale
    :x="{ domain: [-10, 10], image: [0, 500] }"
    :y="{ domain: [-10, 10], image: [500, 0] }"
    :roughness="1"
    :bowing="5"
  >
    <rect
      :x="0"
      :y="0"
      :width="5"
      :height="5"
      @click="onClick"
      @mouseover="onMouseOver"
      :fill="fill"
    ></rect>
    <gline v-bind="lineProps"></gline>
  </scale>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { LineNode } from './interfaces';
import { stepRange } from '../utils/math';
const { props } = defineProps<{ props: { range: number } }>();
console.log(props);
const [xStart, xEnd] = [-10, 10];
const domain = stepRange(xStart, 0.5, xEnd);
const lineProps = computed((): LineNode['data'] => {
  return {
    points: domain.map((x) => [x, Math.sin(x) + props.range * Math.sin(2 * x)]),
    stroke: 'green',
  };
});

const fill = ref('blue');

function onClick() {
  console.log('clicaram aqui');
  fill.value = 'red';
}

function onMouseOver() {
  fill.value = 'green';
}
</script>
