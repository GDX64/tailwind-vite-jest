<template>
  <div
    class="w-52 h-52 bg-red-500 absolute z-10"
    style="will-change: transform"
    ref="el"
  ></div>
  <div
    class="overflow-hidden w-screen h-screen absolute bg-slate-400 top-0 left-0 select-none"
    style="contain: strict"
  >
    <div class="absolute" v-for="el of els" :style="el"></div>
  </div>
</template>

<script setup lang="ts">
import { animationFrames, endWith, exhaustMap, fromEvent, map, takeUntil } from 'rxjs';
import { onMounted, reactive, ref } from 'vue';
import { range } from 'ramda';
import { randomColor, randRange } from '../pixijs/hello/utils';
const el = ref<HTMLElement>();
const els = range(0, 100_000).map(() => {
  return {
    width: randRange(0, 50) + 'px',
    height: randRange(0, 50) + 'px',
    top: randRange(0, 800) + 'px',
    left: randRange(0, 800) + 'px',
    backgroundColor: '#' + randomColor().toString(16),
  };
});
onMounted(() => {
  if (!el.value) return;
});

function rxjsAni(square: HTMLElement) {
  const mouseObs = fromEvent<MouseEvent>(square, 'mousedown').pipe(
    exhaustMap((down) => {
      return fromEvent<MouseEvent>(window, 'mousemove').pipe(
        map((move) => {
          const { clientX, clientY } = move;
          const deltaX = clientX - down.clientX;
          const deltaY = clientY - down.clientY;
          return { deltaX, deltaY };
        }),
        takeUntil(fromEvent<MouseEvent>(window, 'mouseup')),
        endWith({ deltaY: 0, deltaX: 0 })
      );
    })
  );
  const animationObs = animationFrames().pipe(
    map((time) => {
      return { deltaY: 0, deltaX: (Math.sin(time.elapsed / 1000) + 1) * 400 };
    })
  );
  mouseObs.subscribe(({ deltaX, deltaY }) => {
    square.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0px)`;
  });
}
</script>

<style>
@keyframes ani {
  50% {
    transform: translate3d(500px, 0, 0);
  }
  100% {
    transform: translate3d(0px, 0, 0);
  }
}

.square {
  animation: infinite 5s ani;
}
</style>
