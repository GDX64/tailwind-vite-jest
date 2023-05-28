<template>
  <input type="range" v-model.number="range" min="0" max="1000" step="1" />
  <Root :height="100" :width="range" class="w-full aspect-square"></Root>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PixiSquare from '../../vueRenderer/BaseComponents/PixiSquare.vue';
import { transformWorkerRoot } from '../../vueRenderer/RootTransformer';
import Worker from './WorkerDraw?worker';
const Root = transformWorkerRoot(PixiSquare, Worker);
const range = ref(0);
</script>
