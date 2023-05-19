<template>
  <pcontainer>
    <slot :scaleXY="scaleData.scaleXY" :arrDomain="scaleData.arrDomain"></slot>
    <PixiLine
      v-for="line of scaleData.allLines"
      :x0="line.from[0]"
      :y0="line.from[1]"
      :x1="line.to[0]"
      :y1="line.to[1]"
      stroke="black"
    ></PixiLine>
  </pcontainer>
</template>

<script setup lang="ts">
import * as d3 from 'd3';
import { computed, watchEffect } from 'vue';
import { ScaleXY } from './interfaces';
import PixiLine from './BaseComponents/PixiLine.vue';
import { useDrawData } from './UseDraw';

type ScaleData = {
  domain: readonly [number, number];
  image: readonly [number, number];
};

const data = useDrawData();
watchEffect(() => console.log(data.width));

type Point2D = [number, number];

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
  const xLine = { from: [x(initX), y(0)] as Point2D, to: [x(finalX), y(0)] as Point2D };
  const yLine = { from: [x(0), y(initY)] as Point2D, to: [x(0), y(finalY)] as Point2D };
  const xTicks = x.ticks(props.ticks ?? 5).map((num) => {
    return { from: [x(num), y(0) - 3] as Point2D, to: [x(num), y(0) + 3] as Point2D };
  });
  const yTicks = y.ticks(props.ticks ?? 5).map((num) => {
    return { from: [x(0) + 3, y(num)] as Point2D, to: [x(0) - 3, y(num)] as Point2D };
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
