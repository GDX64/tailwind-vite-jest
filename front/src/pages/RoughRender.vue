<template>
  <input type="range" min="0" max="45" v-model.number="range" />
  <Stage>
    <Rect :width="100" :height="100"></Rect>
    <Rect :width="50" :height="50" :x="200" :color="'red'"></Rect>
    <Rect :x="range" v-if="range < 30" :y="100" :width="100" :height="100"></Rect>
  </Stage>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Rect from '../vueRenderer/Rect.vue';
import Stage from '../vueRenderer/Stage.vue';
const range = ref(0);
</script>
