<template>
  <input type="range" :min="0" :max="20" step="1" v-model.number="range" />
  <GStage class="w-full aspect-auto">
    <template #default>
      <pgraphics
        ref="graphics"
        :event-mode="'static'"
        :interactive="true"
        :ontap="onClick"
      ></pgraphics>
    </template>
  </GStage>
  <div class="text-black">
    {{ text }}
  </div>
</template>

<script lang="ts" setup>
import { faker } from '@faker-js/faker';
import { onMounted, reactive, ref, watchEffect } from 'vue';
import TestRender from '../vueRenderer/TestRender.vue';
import { transformDrawRoot } from '../vueRenderer/RootTransformer';
import GStage from '../vueRenderer/GStage.vue';
import { Graphics, Rectangle } from 'pixi.js';
const range = ref(0);
const text = faker.lorem.paragraphs(10);
const graphics = ref<Graphics>();
watchEffect(() => {
  if (graphics.value) {
    graphics.value.clear();
    graphics.value.beginFill(0xff0000);
    graphics.value.drawRect(range.value, 0, 100, 100);
    graphics.value.endFill();
  }
});

function onClick(data: any) {
  console.log(data);
}
</script>
