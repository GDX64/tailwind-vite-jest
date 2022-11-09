<template>
  <div class="w-screen" ref="el"></div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';
import { startSolidApp } from '../solid/Hello';
const el = ref<HTMLElement>();
watchEffect((clear) => {
  if (el.value) {
    clear(startSolidApp(el.value));
  }
});
</script>
