<template>
  <div>
    <header class="flex justify-between w-full mb-1">
      <div class="">{{ company }}</div>
      <div class="">{{ dateAndPlace }}</div>
    </header>
    <div v-if="description != null" class="text-gray-700">
      <div class="rounded-full w-[6px] h-[6px] bg-gray-700 mr-2 inline-block"></div>
      <slot></slot>
      <span spellcheck="true">{{ description }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  company: string;
  dateAndPlace?: string;
  description?: string;
  title?: string;
}>();
</script>
