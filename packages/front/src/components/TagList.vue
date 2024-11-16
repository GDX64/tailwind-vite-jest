<template>
  <div class="flex gap-1">
    <div
      v-for="(tag, index) of tags"
      class="rounded-2xl bg-prime-950 text-text-contrast px-3 py-1 select-none h-fit text-base"
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
  @apply bg-prime-950;
}
.tag2 {
  @apply bg-prime-900;
}
.tag3 {
  @apply bg-prime-800;
}
.tag4 {
  @apply bg-prime-700;
}
</style>
