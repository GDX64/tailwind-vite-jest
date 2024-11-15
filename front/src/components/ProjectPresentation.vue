<template>
  <div
    class="rounded-md p-3 pb-5 hover:bg-prime-100 transition-transform flex flex-col bg-neutral-100 min-h-[400px]"
  >
    <div class="w-full grow flex flex-col gap-2 overflow-hidden">
      <div
        class="w-full relative rounded-md overflow-hidden grow"
        v-for="url of [imgURL].flat()"
      >
        <img
          :src="url"
          alt="Project image"
          class="absolute top-0 left-0 w-full h-full object-cover bg-prime-950"
        />
      </div>
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
  imgURL: string | string[];
}>();
</script>
