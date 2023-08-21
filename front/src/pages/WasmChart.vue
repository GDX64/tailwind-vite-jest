<template>
  <div class="w-full overscroll-none touch-none h-screen max-h-[500px] mt-10">
    <canvas
      ref="canvas"
      class="w-full h-full"
      @pointermove="onpointermove"
      @pointerdown="onpointerdown"
      @pointerup="onpointerup"
      @wheel="onwheel"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import init, { ChartToCommand } from 'incremental_draw/pkg/incremental_draw';
import { onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import { useSize, useAnimationFrames } from '../utils/rxjsUtils';

let disposeFn = () => {};
onUnmounted(() => {
  console.log('unmounting');
  disposeFn();
});

const canvas = ref<HTMLCanvasElement>();
const chart = ref<ChartToCommand>();
const { size } = useSize(canvas);
watchEffect(() => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) return;
  console.log(size);
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

const activePoints = new Map<number, PointerEvent>();
let lastTouchesDistance = 0;
const lastX = { pos: 0, id: -1 };
const info = ref('');
function onpointermove(event: PointerEvent) {
  activePoints.set(event.pointerId, event);
  if (activePoints.size === 1 && lastX.id === event.pointerId) {
    const xNow = event.clientX;
    const deltaX = xNow - lastX.pos;
    lastX.pos = xNow;
    chart.value?.slide(-deltaX);
    console.log('sliding', deltaX);
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

function onpointerup(event) {
  lastX.id = -1;
  activePoints.delete(event.pointerId);
}

function onwheel(event: WheelEvent) {
  chart.value?.wheel(event.deltaY, event.deltaX, lastX.pos);
}
</script>
