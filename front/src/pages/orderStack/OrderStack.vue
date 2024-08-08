<template>
  <div
    class="w-96 bg-yellow-100 flex flex-col relative select-none mt-5 touch-none"
    :style="{ height: height + 'px' }"
    @pointerup="onPointerUp"
    @pointermove="onPointerMove"
  >
    <div
      class="absolute bg-red-500 w-10 border border-black left-5"
      :class="dragging ? 'pointer-events-none' : 'pointer-events-auto'"
      v-for="obj of stacked"
      @pointerdown="onPointerDown(obj.original)"
      :style="{ height: obj.original.width + 'px', top: obj.x + 'px' }"
    >
      {{ obj.original.id }}
    </div>
    <div
      v-for="obj of stacked"
      class="absolute left-16 flex items-center"
      :style="{ top: obj.original.x + obj.original.width / 2 + 'px' }"
    >
      <div class="w-56 h-[1px] bg-black"></div>
      <div class="">
        {{ obj.original.id }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { OrderStack, StackObject } from './OrderStack';

const dragging = ref<StackObject | null>(null);

const stacked = computed(() => {
  return stack.run();
});

function onPointerDown(obj: StackObject) {
  dragging.value = obj;
}

function onPointerUp() {
  console.log('up');
  dragging.value = null;
}

function onPointerMove(event: PointerEvent) {
  if (dragging.value) {
    dragging.value.x += event.movementY;
  }
}

const objects = ref<StackObject[]>([
  ...Array(5)
    .fill(0)
    .map((_, i) => {
      return {
        id: i,
        x: i * 10 + 100,
        width: 50,
      };
    }),
]);
const height = ref(500);

const stack = new OrderStack();
stack.lowerLimit = 0;
stack.upperLimit = height.value;

objects.value.forEach((object) => {
  stack.add(object);
});
</script>
