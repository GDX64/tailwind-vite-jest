<template>
  <div class="mb-1">
    <h2 class="text-sky-600 text-xl">{{ title }}</h2>
    <hr class="w-full border-t-2 border-t-sky-600" />
  </div>
</template>

<script lang="ts" setup>
defineProps<{ title: string }>();
</script>
