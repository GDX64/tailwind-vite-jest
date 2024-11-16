<template>
  <div class="relative pt-6 flex flex-wrap">
    <div class="w-8 z-10 absolute">{{ single }}</div>
    <Arr></Arr>
  </div>
</template>

<script lang="ts" setup>
import { animationFrames } from 'rxjs';
import { defineComponent, onUnmounted, ref, compile } from 'vue';

const Arr = defineComponent({
  setup() {
    const val = ref(Array(3000).fill(10) as number[]);
    return { val };
  },
  template: `
    <div class="" v-for="el of val">{{ el }}</div>
  `,
});

const single = ref('10');
const sub = animationFrames().subscribe(() => {
  single.value = Math.round(Math.random() * 100)
    .toString()
    .padStart(2, '0');
});

onUnmounted(() => sub.unsubscribe());
</script>
