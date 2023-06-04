<template>
  <pcontainer :x="5" :y="pos[1]">
    <template v-memo="[colsize]">
      <pcontainer v-for="index of 10" :y="height * index">
        <PixiSquare :height="height" :width="colsize">first col</PixiSquare>
        <PixiSquare :x="colsize" :height="height" :width="colsize">sec col</PixiSquare>
        <PixiSquare :x="colsize * 2" :height="height" :width="colsize"
          >third col</PixiSquare
        >
      </pcontainer>
    </template>
    <ptext :text="'hello'"></ptext>
  </pcontainer>
</template>

<script setup lang="ts">
import { Graphics, Text } from 'pixi.js';
import { computed, ref, watchEffect } from 'vue';
import { useDrawData } from '../../vueRenderer/UseDraw';
import PixiSquare from '../../vueRenderer/BaseComponents/PixiSquare.vue';
import { useDrag, useElapsed } from '../../utils/rxjsUtils';
import { fromEvent } from 'rxjs';

const drawData = useDrawData();
drawData.roughness = 1;
const graphics = ref<Graphics>();
const height = 50;
const { pos } = useDrag(fromEvent(window, 'pointerdown'));
const colsize = computed(() => (drawData.width - 10) / 3);
const time = useElapsed();

watchEffect(() => {
  const g = graphics.value;
  if (!g) return;

  // g.beginFill(0xff0000);
  // g.drawRect(0, 0, 100, 100);
});
</script>
