<template>
  <input type="range" min="-20" max="20" v-model.number="range" />
  <input type="range" min="0" max="20" v-model.number="points" />
  <Stage>
    <ScaleComp
      :x="{ domain: [-2 * Math.PI, 2 * Math.PI], image: [0, 500] }"
      :y="{ domain: [-1, 1], image: [500, 0] }"
      :domain-points="points"
    >
      <Rect :width="0.5" :height="0.5" :x="0" :y="0" :color="'red'"></Rect>
      <LinePlot :fn="(x) => Math.sin((x * range) / 10)" :color="'blue'"></LinePlot>
    </ScaleComp>
  </Stage>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LinePlot from '../vueRenderer/LinePlot.vue';
import Rect from '../vueRenderer/Rect.vue';
import ScaleComp from '../vueRenderer/ScaleComp.vue';
import Stage from '../vueRenderer/Stage.vue';
const range = ref(1);
const points = ref(5);
</script>
