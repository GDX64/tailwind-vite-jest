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
import SpaceIndexExample from './SpaceIndexExample.ce.vue';
import { defineCustomElement } from 'vue';

const example = defineCustomElement(SpaceIndexExample);
customElements.define('space-index-example', example);
</script>
