<template>
  <input type="range" :min="0" :max="2" step="0.1" v-model="props.range" />
  <GStage :comp="TestRender" class="w-full aspect-auto" :props="props"></GStage>
  <div class="text-black">
    {{ faker.lorem.paragraphs(10) }}
  </div>
</template>

<script lang="ts" setup>
import { faker } from '@faker-js/faker';
import { reactive } from 'vue';
import GStage from '../vueRenderer/GStage.vue';
import TestRender from '../vueRenderer/TestRender.vue';
const props = reactive({ range: 0 });
</script>
