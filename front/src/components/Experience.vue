<template>
  <div class="flex flex-col gap-3 border-l-2 border-text-label pl-3">
    <div class="w-full flex justify-between text-lg">
      <h3 class="font-bold">{{ title }}</h3>
      <h3 class="font-bold">{{ company }}</h3>
    </div>
    <div class="text-text-label font-semibold">{{ date }}</div>
    <div class="flex gap-2">
      <Tag v-for="(tag, index) of tags" :class="`tag${index + 1}`">{{ tag }}</Tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import Tag from './Tag.vue';
defineProps<{
  title: string;
  company: string;
  date: string;
  tags: string[];
}>();
</script>

<style scoped>
.tag1 {
  @apply bg-card-950;
}
.tag2 {
  @apply bg-card-900;
}
.tag3 {
  @apply bg-card-800;
}
.tag4 {
  @apply bg-card-700;
}
</style>
