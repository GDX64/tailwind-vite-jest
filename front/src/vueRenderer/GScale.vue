<template>
  <pcontainer>
    <slot
      :scaleXY="scaleData.scaleXY"
      :arrDomain="scaleData.arrDomain"
      v-if="$slots.default"
    ></slot>
    <template v-if="!noLines">
      <PixiLine
        v-for="line of scaleData.allLines"
        :x0="line.from[0]"
        :y0="line.from[1]"
        :x1="line.to[0]"
        :y1="line.to[1]"
        stroke="black"
      />
    </template>
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
  image?: readonly [number, number];
  padding?: number;
};

const data = useDrawData();

type Point2D = [number, number];

const props = defineProps<{
  xData: ScaleData;
  yData: ScaleData;
  ticks?: number;
  nDomain?: number;
  noLines?: boolean;
}>();

const scaleData = computed(() => {
  const yPadding = props.yData.padding ?? 0;
  const xPadding = props.xData.padding ?? 0;
  const xImage = props.xData?.image ?? [xPadding, data.width - xPadding];
  const yImage = props.yData?.image ?? [yPadding, data.height - yPadding];
  const x = d3.scaleLinear(props.xData.domain, xImage);
  const y = d3.scaleLinear(props.yData.domain, yImage);
  const scaleXY: ScaleXY = {
    x,
    y,
    alphaX: scaleAlpha(x),
    alphaY: scaleAlpha(y),
  };

  const [initX, finalX] = props.xData.domain;
  const [initY, finalY] = props.yData.domain;
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
