<template>
  <div
    class="w-52 h-52 bg-red-500 absolute z-10"
    style="will-change: transform"
    ref="el"
  ></div>
  <iframe src="/lots" class="w-[500px] h-[500px] select-none"></iframe>
</template>

<script setup lang="ts">
import { animationFrames, endWith, exhaustMap, fromEvent, map, takeUntil } from 'rxjs';
import { onMounted, reactive, ref } from 'vue';
const el = ref<HTMLElement>();
onMounted(() => {
  if (!el.value) return;
  rxjsAni(el.value);
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
