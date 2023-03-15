<template>
  <input type="range" min="0" max="45" v-model.number="range" />
  <Stage>
    <ScaleComp
      :x="{ domain: [0, 1], image: [10, 100] }"
      :y="{ domain: [1, 0], image: [10, 100] }"
    >
      <Rect :width="range / 10" :height="0.5" :x="0" :color="'red'"></Rect>
    </ScaleComp>
  </Stage>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Rect from '../vueRenderer/Rect.vue';
import ScaleComp from '../vueRenderer/ScaleComp.vue';
import Stage from '../vueRenderer/Stage.vue';
const range = ref(0);
</script>
