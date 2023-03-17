<template>
  <input type="range" :min="0" :max="2" step="0.1" v-model="props.range" />
  <GStage :comp="TestRender" :props="props"></GStage>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import GStage from '../vueRenderer/GStage.vue';
import TestRender from '../vueRenderer/TestRender.vue';
const props = reactive({ range: 0 });
</script>
