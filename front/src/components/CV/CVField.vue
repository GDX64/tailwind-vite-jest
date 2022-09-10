<template>
  <div class="hover:bg-sky-100">
    <header class="flex justify-between w-full mb-1">
      <div class="">{{ main }}</div>
      <div class="">{{ dateAndPlace }}</div>
    </header>
    <div v-if="hasDescription" class="text-gray-700">
      <div class="rounded-full w-[6px] h-[6px] bg-gray-700 mr-2 inline-block"></div>
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    main: string;
    dateAndPlace?: string;
    title?: string;
    hasDescription?: boolean;
  }>(),
  {
    hasDescription: true,
  }
);
</script>
