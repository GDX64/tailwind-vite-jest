<template>
  <g-container @pointermove="onPointerMove" @pointerdown="onPointerDown">
    <g-rect
      :x="0"
      :y="0"
      :width="data.width"
      :height="data.height"
      fill="#e6aeae"
    />
    <g-raw :x="10" :y="10" :pixiEl="g"> </g-raw>
    <g-text v-for="label of labels" :x="label.x" :y="20" :fontSize="12">
      {{ label.text }}
    </g-text>
  </g-container>
</template>

<script setup lang="ts">
import { Graphics, v8_0_0 } from "pixi.js";
import { ref, watchEffect, computed } from "vue";
import { usePixiAppData } from "../renderer/renderer";

const data = usePixiAppData();
const g = new Graphics();
const dt = new Date(2000, 0, 1);
const formater = new Intl.DateTimeFormat("en", {
  hour: "numeric",
  minute: "numeric",
  hour12: false,
});

const visibleRange = ref([0, 1000] as [number, number]);

const xData = [...Array(1000)].map((_, i) => {
  dt.setMinutes(dt.getMinutes() + 1);
  return formater.format(dt);
});

const labels = computed(() => {
  const labels = [];
  const { width } = data;
  const [begin, end] = visibleRange.value;
  const labelSize = 50;
  const scale = makeScale(visibleRange.value, [0, width]);
  let position = 0;
  for (let i = 0; i < end; i++) {
    const pointPos = scale.transform(i);
    if (pointPos > width) {
      break;
    }
    if (pointPos - position < labelSize) {
      continue;
    }
    labels.push({
      text: xData[i],
      x: pointPos,
    });
    position = pointPos;
  }
  return labels;
});

watchEffect(() => {
  g.clear();
  g.moveTo(0, 0).lineTo(500, 0).stroke();
});

const referencePoint = ref({ x: 0, y: 0, v: [0, 0] as [number, number] });
function onPointerMove(e: PointerEvent) {
  const { y, x } = e;
  const yDelta = referencePoint.value.y - y;
  const xDelta = (referencePoint.value.x - x) / 5;
  const rangeDelta = -yDelta / 50;
  const referenceRange = referencePoint.value.v[1] - referencePoint.value.v[0];
  const newRange = referenceRange * 2 ** rangeDelta;
  const initialx = referencePoint.value.x;
  const finalX = Math.max(0, initialx + xDelta);
  visibleRange.value = [finalX, Math.min(1000, finalX + newRange)];
  console.log(visibleRange.value);
}

function onPointerDown(e: PointerEvent) {
  const { x, y } = e;
  referencePoint.value = { x, y, v: [...visibleRange.value] };
}

function makeScale(domain: [number, number], image: [number, number]) {
  const alpha = (image[1] - image[0]) / (domain[1] - domain[0]);
  const k = image[0] - alpha * domain[0];
  return {
    transform(i: number) {
      return alpha * i + k;
    },
    inverse(x: number) {
      return (x - k) / alpha;
    },
  };
}
</script>
