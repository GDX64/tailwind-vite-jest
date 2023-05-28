<template>
  <Root :height="100" :width="100"></Root>
</template>

<script setup lang="ts">
import PixiSquare from '../../vueRenderer/BaseComponents/PixiSquare.vue';
import { transformWorkerRoot } from '../../vueRenderer/RootTransformer';
import Worker from './WorkerDraw?worker';
const Root = transformWorkerRoot(PixiSquare, Worker);
</script>
