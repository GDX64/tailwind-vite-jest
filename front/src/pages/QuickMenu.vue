<template>
  <div class="relative w-1" tabindex="-1" @keydown="onKeyDown">
    <RecursiveMenu :items="items" class="block"></RecursiveMenu>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { Item } from '../menu/interfaces';
import RecursiveMenu from '../menu/RecursiveMenu.vue';
import { findSelectedPath } from '../menu/utils';
const items: Item[] = [
  { items: [{ text: 'abc' }, { text: 'asdfasdf' }], text: 'menu' },
  { text: 'acb', selection: true },
  { text: 'sdfadf' },
];

const itemPath = ref([] as number[]);
itemPath.value = findSelectedPath((x) => Boolean(x.selection), items) ?? [];

function onKeyDown(event: KeyboardEvent) {
  console.log(event, event.key);
  if (event.key === 'ArrowDown') {
  }
}
</script>
