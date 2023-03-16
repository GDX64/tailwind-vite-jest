<template>
  <rect :x="100" @click="onClick"></rect>
</template>

<script setup lang="ts">
function onClick() {
  console.log('clicaram aqui');
}
</script>
