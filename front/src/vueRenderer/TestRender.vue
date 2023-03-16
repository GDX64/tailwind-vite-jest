<template>
  <rect :x="100" @click="onClick" @mouseover="onMouseOver" :fill="fill"></rect>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const fill = ref('blue');
function onClick() {
  console.log('clicaram aqui');
  fill.value = 'red';
}

function onMouseOver() {
  fill.value = 'green';
}
</script>
