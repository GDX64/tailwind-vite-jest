<template>
  <div>
    <header class="flex justify-between w-full mb-1">
      <div>{{ company }}</div>
      <div>{{ dateAndPlace }}</div>
    </header>
    <div v-if="description" class="">
      <div class="rounded-full w-[6px] h-[6px] bg-sky-600 mr-2 inline-block"></div>
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
