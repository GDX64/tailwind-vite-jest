<template>
  <BackGround>
    <div class="py-4">Iterations {{ stacked?.iterations }}</div>
    <div class="flex items-center gap-4">
      <div class="">Drag with priority</div>
      <input type="checkbox" v-model="dragWithPriority" class="h-5 w-5"></input>
    </div>
    <div
      class="w-full bg-sec-900 flex flex-col relative select-none mt-5 touch-none"
      :style="{ height: height + 'px' }"
      @pointerup="onPointerUp"
      @pointermove="onPointerMove"
    >
      <div
        class="absolute bg-prime-600 w-28 border border-white left-5"
        :class="dragging ? 'pointer-events-none' : 'pointer-events-auto'"
        v-for="obj of objects"
        @pointerdown="onPointerDown(obj)"
        :style="{ height: obj.size + 'px', top: obj.showPosition + 'px' }"
      >
        {{ obj.id }}
      </div>
      <div
        v-for="obj of objects"
        class="absolute left-28 flex items-center -translate-y-1/2 gap-2 pointer-events-none"
        :style="{ top: obj.position + obj.size / 2 + 'px' }"
      >
        <div class="w-56 h-[1px] bg-white"></div>
        <div class="">
          {{ obj.id }}
        </div>
      </div>
    </div>
  </BackGround>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { OrderStack, StackObject } from './OrderStack';
import BackGround from '../BackGround.vue';
import { useAnimationFrames } from '../../utils/rxjsUtils';

type DragObj = StackObject & { id: number; priority: number };
const dragging = ref<DragObj | null>(null);
const dragWithPriority = ref(false);

function onPointerDown(obj: DragObj) {
  dragging.value = obj;
  dragging.value.priority = dragWithPriority.value ? 1 : 0;
}

function onPointerUp() {
  if (dragging.value) {
    dragging.value.priority = 0;
    dragging.value = null;
  }
}

function onPointerMove(event: PointerEvent) {
  if (dragging.value) {
    dragging.value.position += event.movementY;
  }
}

const objects = ref([
  ...Array(8)
    .fill(0)
    .map((_, i) => {
      return {
        id: i,
        position: i * 60 + 100,
        showPosition: i * 60 + 100,
        size: 40 ,
        priority: 0,
      };
    }),
]);

useAnimationFrames(() => {
  objects.value.forEach((obj, i) => {
    const findWithId = stacked.value?.objects.find((o) => o.original.id === obj.id);
    if (findWithId) {
      const isBeingDragged = dragging.value?.id === obj.id;
      if (isBeingDragged) {
        obj.showPosition = findWithId.x;
      } else {
        const diff = findWithId.x - obj.showPosition;
        obj.showPosition = obj.showPosition + diff / 5;
      }
    }
  });
});

const height = ref(600);

const stacked = computed(() => {
  return stack.run(objects.value);
});

const stack = new OrderStack<{
  id: number;
  position: number;
  size: number;
  priority: number;
}>();
stack.lowerLimit = 0;
stack.upperLimit = height.value;
</script>
