<template>
  <input type="range" :min="0" :max="20" step="1" v-model.number="range" />
  <RootRender class="w-full aspect-auto" :range="range" />
  <div class="text-black">
    {{ text }}
  </div>
</template>

<script lang="ts" setup>
import { faker } from '@faker-js/faker';
import { reactive, ref } from 'vue';
import TestRender from '../vueRenderer/TestRender.vue';
import { transformDrawRoot } from '../vueRenderer/RootTransformer';
const RootRender = transformDrawRoot(TestRender);
const range = ref(0);
const text = faker.lorem.paragraphs(10);
</script>
