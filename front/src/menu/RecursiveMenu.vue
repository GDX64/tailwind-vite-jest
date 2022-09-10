<template>
  <ul class="recursive-menu">
    <li
      v-for="item of items"
      class="relative bg-fuchsia-200 border-black border h-6"
      :class="item.selection ? 'bg-sky-200' : ''"
    >
      <div class="">
        {{ item.text }}
      </div>
      <RecursiveMenu v-if="item.items" :items="item.items"></RecursiveMenu>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { Item } from './interfaces';

defineProps<{ items: Item[] }>();
</script>

<style>
.recursive-menu {
  position: absolute;
  top: 0;
  left: 100%;
}
</style>
