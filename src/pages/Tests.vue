<template>
  <BackGroundVue>
    <TestVModelVue v-model:textValue="myValue" v-if="show"></TestVModelVue>
  </BackGroundVue>
</template>

<script lang="ts" setup>
// import BtnTestVue from '../components/BtnTest.vue';
import { ref, watchEffect } from 'vue';
import TestVModelVue from '../components/TestVModel.vue';
import BackGroundVue from './BackGround.vue';

const myValue = ref('');
const show = ref(true);
watchEffect(() => {
  show.value = myValue.value !== 'q';
});
</script>

<style></style>
