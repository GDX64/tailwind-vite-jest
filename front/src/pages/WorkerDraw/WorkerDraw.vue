<template>
  <h1 class="text-xl">this is running on a worker thread!</h1>
  <input type="range" v-model.number="range" min="0" max="500" step="1" />
  <Root :squares="range" class="w-full aspect-square"></Root>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { transformWorkerRoot } from '../../vueRenderer/RootTransformer';
import Worker from './WorkerDraw?worker';
import DrawExample from './DrawExample.vue';
const Root = transformWorkerRoot(DrawExample, Worker, false);
const range = ref(100);
</script>
