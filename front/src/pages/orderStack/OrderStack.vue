<template>
  <div
    class="w-96 bg-yellow-100 flex flex-col relative select-none"
    :style="{ height: height + 'px' }"
    @pointerup="onPointerUp"
    @pointermove="onPointerMove"
  >
    <div
      class="absolute bg-red-500 w-10 border border-black"
      :class="dragging ? 'pointer-events-none' : 'pointer-events-auto'"
      v-for="obj of objects"
      @pointerdown="onPointerDown(obj)"
      :style="{ height: obj.width + 'px', top: obj.calculatedX + 'px' }"
    >
      {{ obj.id }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { OrderStack, StackObject } from './OrderStack';

const dragging = ref<StackObject | null>(null);

function onPointerDown(obj: StackObject) {
  dragging.value = obj;
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
  {
    x: 0,
    id: 0,
    width: 50,
    calculatedX: 0,
  },
  {
    x: 30,
    id: 1,
    width: 50,
    calculatedX: 0,
  },
  {
    x: 60,
    id: 2,
    width: 50,
    calculatedX: 0,
  },
  {
    x: 80,
    id: 3,
    width: 50,
    calculatedX: 0,
  },
  {
    x: 300,
    id: 5,
    width: 50,
    calculatedX: 0,
  },
  {
    x: 320,
    id: 6,
    width: 50,
    calculatedX: 0,
  },
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
