<template>
  <div
    class="bg-yellow-200/30 pr-2 pl-2 pt-2 pb-2 w-fit flex flex-col items-center relative"
  >
    <div
      class="w-10 h-10 bg-red-500 mb-10 flex items-center justify-center"
      draggable="true"
      v-for="item in list"
      @dragstart="dragStart($event, item)"
      @dragover="dragOver"
      @drop="drop"
    >
      {{ item }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const list = ref(['1', '2', '3', '4']);
const dragged = ref(null as null | string);

function dragStart(event: DragEvent, id: string) {
  dragged.value = id;
}

function dragOver(event: DragEvent) {
  event.preventDefault();
  const target = event.target as HTMLElement;
  const overNowKey = target?.attributes.getNamedItem('drag-key')?.value;
  if (dragged.value && overNowKey) {
    list.value = swap(list.value, overNowKey, dragged.value);
  }
  console.log('over', dragged.value);
}

function drop(event: DragEvent) {
  event.preventDefault();
}

function swap<T>(arr: T[], el1: T, el2: T) {
  const index1 = arr.findIndex((item) => item === el1);
  const index2 = arr.findIndex((item) => item === el2);
  const copy = [...arr];
  copy[index1] = el2;
  copy[index2] = el1;
  return copy;
}
</script>

<style></style>
