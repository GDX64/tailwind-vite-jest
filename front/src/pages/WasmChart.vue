<template>
  <div class="py-5 flex gap-2 px-2">
    <select v-model.number="chartKind" class="bg-yellow-200">
      <option value="0">Candles</option>
      <option value="1">Line</option>
      <option value="2">Stick</option>
    </select>
    <div class="">This chart has 1M points, and it's drawn with rust and webassembly</div>
  </div>
  <div
    class="w-full overscroll-none touch-pan-y h-screen max-h-[500px] border-black border-2 bg-yellow-100"
  >
    <canvas
      ref="canvas"
      class="h-full w-full touch-pan-y"
      @pointermove="onpointermove"
      @pointerdown="onpointerdown"
      @pointerup="onpointerup"
      @wheel="onwheel"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import init, { ChartToCommand } from 'incremental_draw/pkg/incremental_draw';
import { onMounted, onUnmounted, ref, watchEffect } from 'vue';
import { useSize, useAnimationFrames } from '../utils/rxjsUtils';

const canvas = ref<HTMLCanvasElement>();
const chart = ref<ChartToCommand>();
const chartKind = ref(0);

watchEffect(() => {
  chart.value?.change_chart_kind(chartKind.value);
});

onUnmounted(() => {
  chart.value?.free();
});
const { size } = useSize(canvas);
watchEffect(() => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx || !size.height || !size.width) return;
  ctx.canvas.width = size.width * devicePixelRatio;
  ctx.canvas.height = size.height * devicePixelRatio;
  chart.value?.on_size_change(
    size.width * devicePixelRatio,
    size.height * devicePixelRatio
  );
});

onMounted(async () => {
  await init();
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) return;
  chart.value = ChartToCommand.new(ctx);
});

useAnimationFrames(() => {
  chart.value?.on_new_frame();
});

function touchPinchMove({
  touchMove = (deltaX: number) => {},
  mousemove = (event: PointerEvent) => {},
  pinch = (delta: number, midX: number) => {},
}) {
  const activePoints = new Map<number, PointerEvent>();
  let lastTouchesDistance = 0;
  const lastX = { pos: 0, id: -1 };
  function onpointermove(event: PointerEvent) {
    activePoints.set(event.pointerId, event);
    if (activePoints.size === 1) {
      if (lastX.id === event.pointerId) {
        const xNow = event.clientX;
        const deltaX = xNow - lastX.pos;
        lastX.pos = xNow;
        chart.value?.slide(-deltaX);
        touchMove(deltaX);
      } else {
        mousemove(event);
      }
      return;
    }
    if (activePoints.size !== 2) return;

    const [event1, event2] = [...activePoints.values()];
    const touchesDistance = Math.hypot(
      event1.clientX - event2.clientX,
      event1.clientY - event2.clientY
    );
    const touchesDelta = touchesDistance - lastTouchesDistance;
    const midx = (event1.clientX + event2.clientX) / 2;
    lastTouchesDistance = touchesDistance;

    chart.value?.zoom(-touchesDelta, midx);
    pinch(touchesDelta, midx);
  }

  function onpointerdown(event: PointerEvent) {
    lastX.id = event.pointerId;
    lastX.pos = event.clientX;
    activePoints.set(event.pointerId, event);
    chart.value?.pointer_down(event.offsetX, event.offsetY);
    if (activePoints.size === 2) {
      const [event1, event2] = [...activePoints.values()];
      const touchesDistance = Math.hypot(
        event1.clientX - event2.clientX,
        event1.clientY - event2.clientY
      );
      lastTouchesDistance = touchesDistance;
    }
  }

  function onpointerup(event: PointerEvent) {
    lastX.id = -1;
    activePoints.clear();
  }

  return { onpointermove, onpointerdown, onpointerup };
}

let xForWheel = 0;
const { onpointerdown, onpointermove, onpointerup } = touchPinchMove({
  touchMove: (deltaX) => {
    chart.value?.slide(-deltaX);
  },
  mousemove: (event) => {
    xForWheel = event.clientX;
  },
  pinch: (delta, midX) => {
    chart.value?.zoom(-delta, midX);
  },
});

function onwheel(event: WheelEvent) {
  chart.value?.wheel(event.deltaY, event.deltaX, xForWheel);
}
</script>
