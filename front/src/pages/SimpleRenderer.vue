<template>
  <div class="w-full px-4 flex flex-col text-base">
    <h2 class="text-4xl my-2">
      {{ header }}
    </h2>
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
    <div class="flex flex-col mb-2">
      <div class="w-max whitespace-nowrap mr-2">frequency: {{ frequency }}Hz</div>
      <input
        type="range"
        class="w-full"
        :min="0"
        :max="2"
        step="0.02"
        v-model.number="frequency"
      />
    </div>
    <GStage ref="stage" class="w-full aspect-auto border border-black h-64">
      <template #default="{}">
        <GScale :x-data="scaleData.x" :y-data="scaleData.y">
          <template #default="{ scaleXY: { x, y, alphaX } }">
            <PixiSquare
              v-for="el of elements"
              :x="x(el - 11)"
              :y="y(10 * Math.sin((time * frequency * 2 * Math.PI) / 1000 + el * phase))"
              :height="alphaX"
              :width="alphaX"
              fill="#00ffff"
              stroke="#ff0000"
            />
          </template>
        </GScale>
      </template>
    </GStage>

    <p class="py-5">{{ text }}</p>
    <GStage ref="stage" class="w-full aspect-square border border-black">
      <template #default>
        <GScale :x-data="scaleData.x" :y-data="scaleData.y" :no-lines="true">
          <template #default="{ scaleXY: { x, y, alphaX, alphaY } }">
            <PIXIEllipse
              :rotation="time / 1000"
              :x="x(0)"
              :y="y(0)"
              :height="alphaX * 20"
              :width="alphaY * 20"
              stroke="#000000"
            />
          </template>
        </GScale>
      </template>
    </GStage>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import GStage from '../vueRenderer/GStage.vue';
import { useElapsed } from '../utils/rxjsUtils';
import GScale from '../vueRenderer/GScale.vue';
import PixiSquare from '../vueRenderer/BaseComponents/PixiSquare.vue';
import PIXIEllipse from '../vueRenderer/BaseComponents/PIXIEllipse.vue';
import { faker } from '@faker-js/faker';
const phase = ref(0.2);
const time = useElapsed();
const stage = ref<InstanceType<typeof GStage>>();
const frequency = ref(0.2);

const text = faker.lorem.paragraph();
const header = faker.lorem.word();

const elements = 20;

const scaleData = computed(() => {
  return {
    x: { domain: [-elements / 2, elements / 2], padding: 20 },
    y: { domain: [elements / 2, -elements / 2], padding: 20 },
  } as const;
});
</script>
