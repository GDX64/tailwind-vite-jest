<template>
  <div class="flex gap-1">
    <div
      v-for="(tag, index) of tags"
      class="rounded-2xl text-text-contrast px-3 py-1 select-none h-fit text-base"
      :class="`tag${index + 1}`"
    >
      {{ tag }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tags: string[];
}>();
</script>

<style scoped>
.tag1 {
  @apply bg-prime-800;
}
.tag2 {
  @apply bg-prime-700;
}
.tag3 {
  @apply bg-prime-600;
}
.tag4 {
  @apply bg-prime-500 text-text-prime;
}
.tag5 {
  @apply bg-prime-400 text-text-prime;
}
</style>
