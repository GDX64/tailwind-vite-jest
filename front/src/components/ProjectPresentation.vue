<template>
  <div
    class="rounded-md p-3 pb-5 hover:border-prime-500 border border-text-prime transition-transform flex flex-col"
  >
    <div class="w-full grow relative rounded-md overflow-hidden">
      <img
        :src="perfil"
        alt="Project image"
        class="absolute top-0 left-0 w-full h-full object-cover grayscale-[100%] hover:grayscale-0 transition-all"
      />
    </div>
    <h3 class="font-bold text-2xl py-2">{{ title }}</h3>
    <div class="grid grid-cols-2 gap-2">
      <h4 class="text-text-label font-semibold">Tags</h4>
      <h4 class="text-text-label font-semibold">Description</h4>
      <TagList :tags="tags" class="flex-wrap" />
      <p>{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import perfil from '../assets/perfil.jfif?url';
import TagList from './TagList.vue';
defineProps<{
  title: string;
  tags: string[];
  description: string;
}>();
</script>
