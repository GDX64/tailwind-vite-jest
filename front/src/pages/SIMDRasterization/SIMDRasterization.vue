<template>
  <div class="px-1 bg-stone-800 text-prime-100 py-1">
    <BlogFormat :content="postMD"></BlogFormat>
  </div>
</template>

<script setup lang="ts">
import BlogFormat from '../../components/BlogFormat.vue';
import BigTriangleExample from './BigTriangleExample.ce.vue';
import { marked } from 'marked';
import postMD from './SIMDPost.md?raw';
import { defineCustomElement } from 'vue';

const parsed = marked(postMD, { async: false });
const triangle = defineCustomElement(BigTriangleExample);
customElements.define('triangle-example', triangle);
</script>
