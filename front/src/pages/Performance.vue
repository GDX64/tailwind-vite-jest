<template>
  <select v-model="testKind">
    <option :value="'DOM'">DOM</option>
    <option :value="'canvas'">canvas</option>
    <option :value="'Offscreen'">Offscreen</option>
    <option :value="'PIXI'">PIXI</option>
    <option :value="'PIXIOff'">PIXI off</option>
  </select>
  <TablePerformance
    :test-kind="testKind"
    v-if="testKind !== 'DOM' && testKind !== 'PIXI'"
    :key="Math.random()"
  >
  </TablePerformance>
  <div class="grid grid-cols-5 w-[700px] text-xs" v-if="testKind === 'DOM'">
    <div class="" v-for="el of table" :style="el.style">
      {{ el.text }}
    </div>
  </div>
  <div ref="pixi"></div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { createData } from '../workers/OffCanvasInst';
import { animationFrames } from 'rxjs';
import TablePerformance from '../components/TablePerformance.vue';
import { tableTest } from '../pixijs/hello/pixiTable';

const table = ref(createData());
const testKind = ref('DOM' as 'canvas' | 'DOM' | 'Offscreen' | 'PIXI' | 'PIXIOff');
const pixi = ref<HTMLElement>();
watchEffect((clear) => {
  if (testKind.value === 'DOM') {
    const sub = animationFrames().subscribe(() => {
      table.value = createData();
    });
    clear(() => sub.unsubscribe());
  } else if (testKind.value === 'PIXI' && pixi.value) {
    // clear(tableTest(pixi.value));
  }
});
</script>

<style></style>
