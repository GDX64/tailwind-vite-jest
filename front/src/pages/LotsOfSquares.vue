<template>
  <div
    class="overflow-hidden w-screen h-screen absolute bg-slate-400 top-0 left-0 select-none"
    style="contain: strict"
  >
    <div class="absolute" v-for="el of els" :style="el"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { range } from 'ramda';
import { randomColor, randRange } from '../pixijs/hello/utils';
const el = ref<HTMLElement>();
const els = range(0, 30_000).map(() => {
  return {
    width: randRange(0, 50) + 'px',
    height: randRange(0, 50) + 'px',
    top: randRange(0, 800) + 'px',
    left: randRange(0, 800) + 'px',
    backgroundColor: '#' + randomColor().toString(16),
  };
});
</script>
