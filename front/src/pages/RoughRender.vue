<template>
  <input type="range" min="-10" max="10" v-model.number="range" />
  <Stage>
    <ScaleComp
      :x="{ domain: [-1, 1], image: [0, 500] }"
      :y="{ domain: [-1, 1], image: [500, 0] }"
    >
      <Rect :width="0.5" :height="0.5" :x="0" :y="range / 10" :color="'red'"></Rect>
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
