<template>
  <rect :x="props.range * 100" :w="200" @click="onClick"></rect>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue';
const { props } = defineProps<{ props: { range: number } }>();

function onClick() {
  console.log('click');
}
</script>
