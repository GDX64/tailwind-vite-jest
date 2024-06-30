<template>
  <div class="">
    <header
      ref="header"
      class="flex justify-between sm:items-start w-full mb-1 flex-col sm:flex-row"
    >
      <div class="">{{ main }}</div>
      <div class="text-sm text-sec-700">{{ dateAndPlace }}</div>
    </header>
    <div class="text-sec-800 pl-2" ref="descriptionEl" v-if="description">
      <div class="rounded-full w-[6px] h-[6px] bg-sec-800 mr-2 inline-block"></div>
      <LinkProcess class="text-with-link" :text="description"></LinkProcess>
    </div>
  </div>
</template>

<script lang="ts" setup>
import LinkProcess from './LinkProcess';
import { ref } from 'vue';

defineEmits<{
  (event: 'update:main', value: string): void;
  (event: 'update:description', value: string): void;
  (event: 'update:dateAndPlace', value: string): void;
}>();

defineProps<{
  main: string;
  dateAndPlace?: string;
  title?: string;
  description?: string;
}>();
const header = ref<HTMLElement>();
const descriptionEl = ref<HTMLElement>();
</script>
