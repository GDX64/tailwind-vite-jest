<template>
  <div class="py-1">
    <h2 class="text-prime-800 text-xl">{{ title }}</h2>
    <hr class="w-full border-t-2 border-t-prime-800" />
  </div>
</template>

<script lang="ts" setup>
defineProps<{ title: string }>();
</script>
