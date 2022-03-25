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
      education: [
        {
          title: 'Electro-Mechanical Technician',
          schoolPlaceDate: 'ETPC - Volta Redonda, RJ. 2011-2013',
        },
        {
          title: 'Electronic Engineering Bachelor',
          schoolPlaceDate: 'UFJF - Juiz de fora, MG. 2014-2019',
          description:
            'The course had more emphasis in Signal Processing, where I used Matlab and Python programming.',
        },
        {
          description: `I went for a 2 semesters interchange in Argentina whilst I developed my bachelor thesis. 
          There I studied adaptive signal processing, machine learning and computer graphics (where I learned Javascript).`,
          schoolPlaceDate: 'UBA - Buneos Aires, AR. 2019',
          title: 'Electronic Engineering Interchange',
        },
      ],
    }"
  ></CVSimpleVue>
</template>

<script lang="ts" setup>
import CVSimpleVue from '../components/CV/CVSimple.vue';
import { Icons } from '../components/CV/SimpleCVTypes';
</script>
