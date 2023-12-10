<template>
  <div class="my-blog-post" v-html="parsed"></div>
</template>

<script setup lang="ts">
import hljs from 'highlight.js/lib/core';
import rust from 'highlight.js/lib/languages/rust';
import wasm from 'highlight.js/lib/languages/wasm';
import 'highlight.js/styles/stackoverflow-dark.css';
import { onMounted, onUpdated } from 'vue';
import { marked } from 'marked';

hljs.registerLanguage('rust', rust);
hljs.registerLanguage('wasm', wasm as any);

const props = defineProps<{
  content: string;
}>();
const parsed = marked(props.content, { async: false });

onUpdated(() => {
  hljs.highlightAll();
});
onMounted(() => {
  hljs.highlightAll();
});
</script>
