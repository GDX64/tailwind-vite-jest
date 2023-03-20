<template>
  <group>
    <slot :scaleXY="scaleData.scaleXY" :arrDomain="scaleData.arrDomain"></slot>
    <gline
      v-for="line of scaleData.allLines"
      :points="[line.from, line.to]"
      stroke="black"
    ></gline>
  </group>
</template>

<script setup lang="ts">
import * as d3 from 'd3';
import { range } from 'ramda';
import { computed } from 'vue';
import { ScaleXY } from './interfaces';

type ScaleData = {
  domain: [number, number];
  image: [number, number];
};

const props = defineProps<{
  x: ScaleData;
  y: ScaleData;
  ticks?: number;
  nDomain?: number;
}>();
const scaleData = computed(() => {
  const x = d3.scaleLinear(props.x.domain, props.x.image);
  const y = d3.scaleLinear(props.y.domain, props.y.image);
  const scaleXY: ScaleXY = {
    x,
    y,
    alphaX: scaleAlpha(x),
    alphaY: scaleAlpha(y),
  };

  const [initX, finalX] = props.x.domain;
  const [initY, finalY] = props.y.domain;
  const xLine = { from: [x(initX), y(0)], to: [x(finalX), y(0)] };
  const yLine = { from: [x(0), y(initY)], to: [x(0), y(finalY)] };
  const xTicks = x.ticks(props.ticks ?? 5).map((num) => {
    return { from: [x(num), y(0) - 3], to: [x(num), y(0) + 3] };
  });
  const yTicks = y.ticks(props.ticks ?? 5).map((num) => {
    return { from: [x(0) + 3, y(num)], to: [x(0) - 3, y(num)] };
  });

  const nDomain = props.nDomain ?? 10;
  const arrDomain = x.ticks(nDomain);
  return {
    xLine,
    yLine,
    xTicks,
    yTicks,
    scaleXY,
    allLines: [xLine, yLine, ...xTicks, ...yTicks],
    arrDomain,
  };
});

function scaleAlpha(s: d3.ScaleLinear<number, number>) {
  const [d1, d2] = s.domain();
  const [i1, i2] = s.range();
  return (i2 - i1) / (d2 - d1);
}
</script>
