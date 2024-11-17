<template>
  <a :href="CVLinks.linkedin" target="_blank">
    <Linkedin
      class="hover:text-hover hover:scale-105 transition-all cursor-pointer"
    ></Linkedin>
  </a>
</template>
<script setup lang="ts">
import Linkedin from '../../assets/linkedin-home.svg?component';
import { CVLinks } from '../CV/glmachadoCVData';
</script>
