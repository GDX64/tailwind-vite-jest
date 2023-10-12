<script setup lang="ts">
import { ref } from "vue";
const val = ref(0);
setInterval(() => {
  val.value++;
}, 500);
</script>

<template>
  <g-rect :width="100" :height="100" :fill="0xff0000">
    <g-text
      v-for="el in 1000"
      :x="Math.random() * 500"
      :y="Math.random() * 500"
      :fontSize="10"
      >{{ val }}</g-text
    >
  </g-rect>
</template>

<style scoped></style>

