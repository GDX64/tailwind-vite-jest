<template>
  <div class="w-full px-4 flex flex-col text-base font-bold">
    <div class="flex flex-col">
      <div class="whitespace-nowrap mr-2">phase: {{ phase }}</div>
      <input
        type="range"
        class="w-full"
        :min="0"
        :max="1"
        step="0.01"
        v-model.number="phase"
      />
    </div>
    <div class="flex flex-col">
      <div class="w-max whitespace-nowrap mr-2">frequency: {{ frequency }}Hz</div>
      <input
        type="range"
        class="w-full"
        :min="0"
        :max="5"
        step="0.1"
        v-model.number="frequency"
      />
    </div>
  </div>
  <GStage ref="stage" class="w-full aspect-auto">
    <template #default>
      <GScale :x-data="scaleData.x" :y-data="scaleData.y">
        <template #default="{ scaleXY: { x, y } }">
          <PixiSquare
            v-for="el of elements"
            :x="x(el - 11)"
            :y="y(10 * Math.sin((time * frequency * 2 * Math.PI) / 1000 + el * phase))"
            :height="20"
            :width="20"
            fill="#00ffff"
            stroke="#ff0000"
          />
        </template>
      </GScale>
    </template>
  </GStage>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import GStage from '../vueRenderer/GStage.vue';
import { useElapsed } from '../utils/rxjsUtils';
import GScale from '../vueRenderer/GScale.vue';
import PixiSquare from '../vueRenderer/BaseComponents/PixiSquare.vue';
const phase = ref(0);
const time = useElapsed();
const stage = ref<InstanceType<typeof GStage>>();
const frequency = ref(1);

const elements = 20;

const scaleData = computed(() => {
  return {
    x: { domain: [-elements / 2, elements / 2], padding: 10 },
    y: { domain: [-elements / 2, elements / 2], padding: 20 },
  } as const;
});
</script>
