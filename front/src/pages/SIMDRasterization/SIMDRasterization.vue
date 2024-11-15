<template>
  <BackGround>
    <BlogFormat>
      <VueComponent></VueComponent>
    </BlogFormat>
  </BackGround>
</template>

<script setup lang="ts">
import BlogFormat from '../../components/BlogFormat.vue';
import BigTriangleExample from './BigTriangleExample.ce.vue';
import { VueComponent } from './SIMDPost.md';
import { defineCustomElement } from 'vue';
import BackGround from '../BackGround.vue';

const name = 'triangle-example';
if (!customElements.get(name)) {
  const triangle = defineCustomElement(BigTriangleExample);
  customElements.define(name, triangle);
}
</script>
