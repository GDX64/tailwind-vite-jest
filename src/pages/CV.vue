<template>
  <CVSimpleVue
    :cv-data="{
      name: 'Gabriel Eduardo de Lima Machado',
      title: 'Software Developer',
      arrUserInfo: [
        {
          icon: Icons.Globe,
          text: 'glmachado.herokuapp.com',
          link: 'https://glmachado.herokuapp.com',
        },
        { icon: Icons.Mobile, text: '+55 32 98493-5474' },
        { icon: Icons.Envelope, text: 'gabriel.delmachado@gmail.com' },
        { icon: Icons.GitHub, text: 'GDX64', link: 'https://github.com/GDX64' },
        { icon: Icons.Location, text: 'Porto Real, RJ, BR' },
        {
          icon: Icons.Linkedin,
          text: 'gabriel-e-l-machado',
          link: 'https://www.linkedin.com/in/gabriel-e-l-machado/',
        },
      ],
    }"
  ></CVSimpleVue>
</template>

<script lang="ts" setup>
import CVSimpleVue from '../components/CV/CVSimple.vue';
import { Icons } from '../components/CV/SimpleCVTypes';
</script>
