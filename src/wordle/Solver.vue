<template>
  <BackGround>
    <button @click="main">play</button>
  </BackGround>
</template>

<script lang="ts" setup>
import init from 'wasm';
import BackGround from '../pages/BackGround.vue';

console.log('BEGIN');
const { main } = await init();
console.log('finish');
</script>
