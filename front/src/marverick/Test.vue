<template>
  <container :matrix="matrix">
    <container>
      <txt :fontSize="50" :color="myProps.color">hello</txt>
    </container>
  </container>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ myProps: { color: string; rotation: number } }>();
const matrix = computed(() =>
  new DOMMatrix().translate(100, 300).rotate(props.myProps.rotation)
);
</script>
