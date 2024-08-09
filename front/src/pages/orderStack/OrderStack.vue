<template>
  <BackGround>
    <div class="py-4">Iterations {{ stacked?.iterations }}</div>
    <div
      class="w-full bg-sec-900 flex flex-col relative select-none mt-5 touch-none"
      :style="{ height: height + 'px' }"
      @pointerup="onPointerUp"
      @pointermove="onPointerMove"
    >
      <div
        class="absolute bg-prime-600 w-10 border border-white left-5"
        :class="dragging ? 'pointer-events-none' : 'pointer-events-auto'"
        v-for="obj of stacked?.objects ?? []"
        @pointerdown="onPointerDown(obj.original)"
        :style="{ height: obj.original.size + 'px', top: obj.x + 'px' }"
      >
        {{ obj.original.id }}
      </div>
      <div
        v-for="obj of stacked?.objects ?? []"
        class="absolute left-16 flex items-center -translate-y-1/2 gap-2"
        :style="{ top: obj.original.position + obj.original.size / 2 + 'px' }"
      >
        <div class="w-56 h-[1px] bg-white"></div>
        <div class="">
          {{ obj.original.id }}
        </div>
      </div>
    </div>
  </BackGround>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { OrderStack, StackObject } from './OrderStack';
import BackGround from '../BackGround.vue';

const dragging = ref<StackObject | null>(null);

function onPointerDown(obj: StackObject) {
  dragging.value = obj;
}

function onPointerUp() {
  dragging.value = null;
}

function onPointerMove(event: PointerEvent) {
  if (dragging.value) {
    dragging.value.position += event.movementY;
  }
}

const objects = ref([
  ...Array(5)
    .fill(0)
    .map((_, i) => {
      return {
        id: i,
        position: i * 60 + 100,
        size: 50 + i * 10,
      };
    }),
]);
const height = ref(600);

const stacked = computed(() => {
  return stack.run(objects.value);
});

const stack = new OrderStack<{ id: number; position: number; size: number }>();
stack.lowerLimit = 0;
stack.upperLimit = height.value;
</script>
