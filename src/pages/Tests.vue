<template>
  <BackGroundVue>
    <TestVModelVue v-model:textValue="myValue" v-if="show"></TestVModelVue>
  </BackGroundVue>
</template>

<script lang="ts" setup>
// import BtnTestVue from '../components/BtnTest.vue';
import { ref, watchEffect } from 'vue';
import TestVModelVue from '../components/TestVModel.vue';
import { provideTestStore } from '../stores/testStore';
import BackGroundVue from './BackGround.vue';

const myValue = ref('');
const show = ref(true);
provideTestStore();
</script>

<style></style>
