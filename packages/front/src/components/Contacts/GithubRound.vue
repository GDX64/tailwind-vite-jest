<template>
  <a :href="CVLinks.github" target="_blank">
    <Github
      class="hover:text-hover hover:scale-105 transition-all cursor-pointer"
    ></Github>
  </a>
</template>
<script lang="ts" setup>
import Github from '../../assets/github-home.svg?component';
import { CVLinks } from '../CV/glmachadoCVData';
</script>
