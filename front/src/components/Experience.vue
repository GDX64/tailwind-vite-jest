<template>
  <div class="flex flex-col gap-3 border-l-2 border-text-label pl-3">
    <div class="w-full flex justify-between text-lg">
      <h3 class="font-bold">{{ title }}</h3>
      <h3 class="underline text-prime-900">{{ company }}</h3>
    </div>
    <div class="text-text-label font-semibold">{{ date }}</div>
    <div class="flex gap-2">
      <TagList :tags="tags" />
    </div>
  </div>
</template>

<script setup lang="ts">
import TagList from './TagList.vue';
defineProps<{
  title: string;
  company: string;
  date: string;
  tags: string[];
}>();
</script>
