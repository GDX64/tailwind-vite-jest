<script setup lang="ts">
import { faker } from '@faker-js/faker';
import BackGroundVue from './BackGround.vue';
</script>

<template>
  <BackGroundVue>
    <h1 class="text-xl">Trust me, I'm an engineer</h1>
    <p class="">{{ faker.lorem.paragraph(200) }}</p>
  </BackGroundVue>
</template>

<style></style>
