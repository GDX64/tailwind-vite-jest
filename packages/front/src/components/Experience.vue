<template>
  <BorderContainer
    class="w-full flex flex-col gap-1 p-3 cursor-pointer hover:-translate-x-1"
    @click="isOpen = !isOpen"
  >
    <div class="w-full flex justify-between text-lg">
      <h3 class="font-bold">{{ title }}</h3>
      <h3 class="">{{ company }}</h3>
    </div>
    <div class="text-text-label font-semibold">{{ date }}</div>
    <div class="transition-all w-full overflow-hidden" :class="isOpen ? 'h-24' : 'h-0'">
      {{ description }}
    </div>
    <div class="flex gap-2">
      <TagList :tags="tags" />
    </div>
  </BorderContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TagList from './TagList.vue';
import BorderContainer from './BorderContainer.vue';

const isOpen = ref(false);

defineProps<{
  title: string;
  company: string;
  date: string;
  tags: string[];
  description: string;
}>();
</script>
