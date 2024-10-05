<template>
  <BackGround>
    <BlogFormat>
      <VueComponent />
    </BlogFormat>
  </BackGround>
</template>

<script lang="ts" setup>
import BlogFormat from '../../components/BlogFormat.vue';
import BackGround from '../BackGround.vue';
import { VueComponent } from './SpaceIndex.md';
import QuadTreeCe from './QuadTree.ce.vue';
import { defineCustomElement } from 'vue';

const quadTree = defineCustomElement(QuadTreeCe);
customElements.define('quad-tree-example', quadTree);
</script>
