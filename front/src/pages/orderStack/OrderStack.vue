<template>
  <div
    class="w-96 bg-yellow-100 flex flex-col relative select-none mt-5"
    :style="{ height: height + 'px' }"
    @pointerup="onPointerUp"
    @pointermove="onPointerMove"
  >
    <div class="bg-sky-600 right-6 w-fit absolute" @click="run">RUN</div>
    <div
      class="absolute bg-red-500 w-10 border border-black left-5"
      :class="dragging ? 'pointer-events-none' : 'pointer-events-auto'"
      v-for="obj of objects"
      @pointerdown="onPointerDown(obj)"
      :style="{ height: obj.width + 'px', top: obj.calculatedX + 'px' }"
    >
      {{ obj.id }}
    </div>
    <div
      v-for="obj of objects"
      class="h-[1px] w-56 bg-black absolute left-5"
      :style="{ top: obj.x + 'px' }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { OrderStack, StackObject } from './OrderStack';

const dragging = ref<StackObject | null>(null);

function onPointerDown(obj: StackObject) {
  dragging.value = obj;
}

function run() {
  stack.run();
}

function onPointerUp() {
  dragging.value = null;
}

function onPointerMove(event: PointerEvent) {
  if (dragging.value) {
    dragging.value.x += event.movementY;
    stack.run();
  }
}

const objects = ref<StackObject[]>([
  ...Array(10)
    .fill(0)
    .map((_, i) => {
      return {
        id: i,
        x: i * 10 + 100,
        width: 20,
        calculatedX: 0,
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

stack.run();
</script>
