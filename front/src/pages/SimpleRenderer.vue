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
  <GStage class="w-full aspect-auto">
    <template #default>
      <pcontainer>
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
import { ref } from 'vue';
import GStage from '../vueRenderer/GStage.vue';
import { Graphics } from 'pixi.js';
import PixiSquare from '../vueRenderer/BaseComponents/PixiSquare.vue';
import { useElapsed } from '../utils/rxjsUtils';
const range = ref(0);
const text = faker.lorem.paragraphs(10);
const time = useElapsed();

function initGraphics(g: Graphics) {
  g.clear();
  g.beginFill(0xff0000);
  g.drawRect(0, 0, 100, 100);
  g.endFill();
}

function onClick(data: any) {
  console.log(data);
}
</script>
