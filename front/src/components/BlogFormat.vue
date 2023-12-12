<template>
  <div class="my-blog-post" v-html="parsed"></div>
</template>

<script setup lang="ts">
import hljs from 'highlight.js/lib/core';
import rust from 'highlight.js/lib/languages/rust';
import wasm from 'highlight.js/lib/languages/wasm';
import toml from 'highlight.js/lib/languages/yaml';
import 'highlight.js/styles/tokyo-night-dark.css';
import { onMounted, onUpdated } from 'vue';
import { marked } from 'marked';

hljs.registerLanguage('rust', rust);
hljs.registerLanguage('wasm', wasm as any);
hljs.registerLanguage('toml', toml);

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

<style>
.my-blog-post h1,
h2 {
  font-weight: bold;
  @apply text-2xl mb-5 text-prime-300;
}

.my-blog-post code {
  overscroll-behavior: auto;
}

.my-blog-post {
  @apply text-prime-200;
}

.my-blog-post pre {
  @apply text-sm mb-5;
}

.my-blog-post {
  @apply text-lg;
}

.my-blog-post ul {
  list-style-type: circle;
  list-style-position: inside;
}

.my-blog-post p,
ul {
  @apply mb-5;
}

.my-blog-post a {
  @apply text-high-200;
  text-decoration: underline;
}
</style>
