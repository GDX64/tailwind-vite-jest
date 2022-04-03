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
      projects: [
        {
          title: 'Bachelor Thesis',
          description: `In my thesis I implemented adaptive filtering algorithms from papers with
            Matlab to analyse harmonics from the electrical energy network. In this work I
            had the opportunity to work with some advanced Linear Algebra to implement the
            computations. I wrote it while I was in the interchange in Argentina. You can
            download it [here](https://glmachado.herokuapp.com/files/TCC.pdf) (it is in my website).`,
          schoolPlaceDate: '2019',
        },
        {
          title: 'Personal Website',
          description: `I've built my personal website some time ago, 
          it is a little bit outdated but it has some interesting 3D animations and computer Graphics related things,
          wich I like to learn in my spare time.`,
        },
        {
          title: 'Blogs And Small Articles',
          description: `When I'm learning something new, I like to write about it. So I have a
          [Medium](https://medium.com/@gabriel-delmachado) with some engineering, math and
          programming related articles. I also have some content on Linkedin.`,
        },
      ],
      experiences: [
        {
          title: 'Nelogica - Software Developer',
          description: `Nelogica is the biggest trading software company in Brazil, and has several trading platforms. 
          I was hired in 2020 to work in the Web Platforms as a Javascript developer, creating and improving our trading dashboards.
          Now I work more on performance related subjects inside the Web Platforms and the transition to Typescript.`,
          schoolPlaceDate: 'Porto Alegre - RS, BR. 2020-(Now)',
        },
        {
          title: 'PSA - Intern',
          schoolPlaceDate: 'Buenos Aires, AR. 2019',
          description: `I've worked for two months as a Maintenance Intern in PSA, helping in the control of spare parts.`,
        },
      ],
    }"
  ></CVSimpleVue>
</template>

<script lang="ts" setup>
import CVSimpleVue from '../components/CV/CVSimple.vue';
import { Icons } from '../components/CV/SimpleCVTypes';
</script>
