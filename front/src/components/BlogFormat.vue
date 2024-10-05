<template>
  <div class="my-blog-post w-full overflow-hidden">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import hljs from 'highlight.js/lib/core';
import rust from 'highlight.js/lib/languages/rust';
import wasm from 'highlight.js/lib/languages/wasm';
import toml from 'highlight.js/lib/languages/yaml';
import ts from 'highlight.js/lib/languages/typescript';
import { onMounted } from 'vue';
import './codeStyle.css';

hljs.registerLanguage('rust', rust);
hljs.registerLanguage('wasm', wasm);
hljs.registerLanguage('toml', toml);
hljs.registerLanguage('typescript', ts);

onMounted(() => {
  hljs.highlightAll();
});
</script>

<style>
.my-blog-post h1,
h2 {
  font-weight: bold;
  @apply text-2xl mb-5;
}

.my-blog-post li::marker {
  @apply text-high-200;
}

.my-blog-post code:not(.hljs) {
  @apply italic text-high-200 bg-sec-900 rounded-sm px-1;
}

.my-blog-post code {
  overscroll-behavior: auto;
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
