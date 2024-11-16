<template>
  <div class="" ref="el"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { runExample } from 'syncjs';
import 'syncjs/styles';

const el = ref<HTMLElement>();
let destroy = () => {};
onMounted(() => {
  destroy = runExample(el.value!);
});
onUnmounted(() => destroy());
</script>
