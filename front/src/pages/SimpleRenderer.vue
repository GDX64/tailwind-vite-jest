<template>
  <div class="w-full px-4">
    <input
      type="range"
      class="w-full"
      :min="0"
      :max="50"
      step="1"
      v-model.number="range"
    />
  </div>
  <GStage ref="stage" class="w-full aspect-auto">
    <template>
      <pcontainer>
        <GScale :x="scaleData.x" :y="scaleData.y"></GScale>
        <PixiLine
          :x0="0"
          :y0="0"
          :x1="200"
          :y1="200"
          :to="[300, 300]"
          stroke="#ff0000"
        ></PixiLine>
        <PixiSquare
          v-for="el of range"
          :x="el * 4"
          :y="Math.sin(time / 1000 + el) * 200 + 200"
          :height="20"
          :width="20"
          fill="#00ffff"
          stroke="#ff0000"
        ></PixiSquare>
      </pcontainer>
    </template>
  </GStage>
  <div class="text-black">
    {{ text }}
  </div>
</template>

<script lang="ts" setup>
import { faker } from '@faker-js/faker';
import { computed, ref } from 'vue';
import GStage from '../vueRenderer/GStage.vue';
import PixiSquare from '../vueRenderer/BaseComponents/PixiSquare.vue';
import { useElapsed } from '../utils/rxjsUtils';
import PixiLine from '../vueRenderer/BaseComponents/PixiLine.vue';
import GScale from '../vueRenderer/GScale.vue';
const range = ref(0);
const text = faker.lorem.paragraphs(10);
const time = useElapsed();
const stage = ref<InstanceType<typeof GStage>>();

const scaleData = computed(() => {
  const data = stage.value?.drawData;
  return {
    x: { domain: [-10, 10], image: [0, data?.width ?? 100] },
    y: { domain: [-10, 10], image: [0, data?.height ?? 100] },
  } as const;
});
</script>
