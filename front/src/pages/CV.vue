<template>
  <div class="flex justify-between">
    <CVSimpleVue></CVSimpleVue>
  </div>
</template>

<script lang="ts" setup>
import CVSimpleVue from '../components/CV/CVSimple.vue';
import { provideCV } from '../components/CV/CVStore';
import glmachadoCVData from '../components/CV/glmachadoCVData';

provideCV(glmachadoCVData);
</script>
