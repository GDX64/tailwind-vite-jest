<template>
  <pcontainer>
    <slot
      :scaleXY="scaleData.scale"
      :arrDomain="scaleData.arrDomain"
      :ticks="scaleData.ticks"
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
import { computed, reactive } from 'vue';
import { ScaleXY } from './interfaces';
import PixiLine from './BaseComponents/PixiLine.vue';
import { provideScale, useDrawData } from './UseDraw';

type ScaleData = {
  domain?: readonly [number, number];
  image?: readonly [number, number];
  padding?: number;
};

const data = useDrawData();

type Point2D = [number, number];

const props = defineProps<{
  xData?: ScaleData;
  yData?: ScaleData;
  ticks?: number;
  nDomain?: number;
  noLines?: boolean;
}>();

const scaleData = computed(() => {
  const { xData, yData } = props ?? {};
  const yPadding = yData?.padding ?? 0;
  const xPadding = xData?.padding ?? 0;
  const xImage = xData?.image ?? [xPadding, data.width - xPadding];
  const xDomain = xData?.domain ?? xImage;
  const yImage = yData?.image ?? [data.height - yPadding, yPadding];
  const yDomain = yData?.domain ?? [yPadding, data.height - yPadding];

  const x = d3.scaleLinear(xDomain, xImage);
  const y = d3.scaleLinear(yDomain, yImage);
  const scale: ScaleXY = {
    x,
    y,
    alphaX: scaleAlpha(x),
    alphaY: scaleAlpha(y),
  };

  const [initX, finalX] = xData?.domain ?? xImage;
  const [initY, finalY] = yData?.domain ?? yImage;
  const xLine = { from: [x(initX), y(0)] as Point2D, to: [x(finalX), y(0)] as Point2D };
  const yLine = { from: [x(0), y(initY)] as Point2D, to: [x(0), y(finalY)] as Point2D };
  const ticks = { x: x.ticks(props.ticks ?? 5), y: y.ticks(props.ticks ?? 5) };
  const xTicks = ticks.x.map((num) => {
    return { from: [x(num), y(0) - 3] as Point2D, to: [x(num), y(0) + 3] as Point2D };
  });
  const yTicks = ticks.y.map((num) => {
    return { from: [x(0) + 3, y(num)] as Point2D, to: [x(0) - 3, y(num)] as Point2D };
  });

  const nDomain = props.nDomain ?? 10;
  const arrDomain = x.ticks(nDomain);
  return {
    ticks,
    scale,
    allLines: [xLine, yLine, ...xTicks, ...yTicks],
    arrDomain,
  };
});

function scaleAlpha(s: d3.ScaleLinear<number, number>) {
  const [d1, d2] = s.domain();
  const [i1, i2] = s.range();
  return (i2 - i1) / (d2 - d1);
}

const scale = computed(() => scaleData.value.scale);
provideScale(reactive({ scale }));
</script>
