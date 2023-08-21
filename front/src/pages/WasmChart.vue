<template>
  <div
    class="place-to-mount-the-chart w-full overscroll-none touch-none h-screen max-h-[500px]"
  >
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

let isPointerDown = false;
function onpointermove(event: PointerEvent) {
  chart.value?.pointer_move(event.offsetX, event.offsetY, isPointerDown);
}

function onpointerdown(event: PointerEvent) {
  isPointerDown = true;
  chart.value?.pointer_down(event.offsetX, event.offsetY);
}

function onpointerup() {
  isPointerDown = false;
}

function onwheel(event: WheelEvent) {
  chart.value?.wheel(event.deltaY, event.deltaX);
}
</script>
