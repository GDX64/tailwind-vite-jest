<template>
  <pre class="theme-stackoverflow-dark">
    <code >
      {{ code }}
    </code>
  </pre>
</template>

<script setup lang="ts">
import hljs from 'highlight.js/lib/core';
import rust from 'highlight.js/lib/languages/rust';
import 'highlight.js/styles/stackoverflow-dark.css';
import { computed, onMounted, onUpdated } from 'vue';

hljs.registerLanguage('rust', rust);

const props = defineProps<{
  code: string;
}>();

onUpdated(() => {
  hljs.highlightAll();
});
onMounted(() => {
  hljs.highlightAll();
});
</script>
