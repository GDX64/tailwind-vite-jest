<template>
  <div class="flex w-full justify-center items-center">
    <div class="cv-container">
      <header class="flex items-center flex-col text-sm">
        <h1 class="text-sky-600 text-3xl mb-2">Gabriel Eduardo de Lima Machado</h1>
        <h2 class="text-sky-600 text-xl mb-4">Software Developer</h2>
        <div class="icons-container mb-2">
          <div class="flex">
            <Globe class="cv-icon"></Globe
            ><a href="https://glmachado.herokuapp.com">glmachado.herokuapp.com</a>
          </div>
          <div class="flex whitespace-nowrap">
            <Mobile class="cv-icon"></Mobile>+55 32 98493-5474
          </div>
          <div class="flex">
            <Envelope class="cv-icon"></Envelope>gabriel.delmachado@gmail.com
          </div>
          <div class="flex">
            <GitHub class="cv-icon"></GitHub><a href="https://github.com/GDX64">GDX64</a>
          </div>
          <div class="flex">
            <Location class="cv-icon"></Location>
            Porto Real, RJ, BR
          </div>
          <div class="flex">
            <Linkedin class="cv-icon"></Linkedin>
            <a href="https://www.linkedin.com/in/gabriel-e-l-machado/"
              >gabriel-e-l-machado</a
            >
          </div>
        </div>
      </header>
      <div class="education">
        <FieldTitleVue title="Education"></FieldTitleVue>
        <Field
          company="Electro-Mechanical Technician"
          date-and-place="ETPC - Volta Redonda, RJ"
          class="mb-2"
        ></Field>
        <Field
          company="Electronic Engineering Bachelor"
          date-and-place="UFJF - Juiz de fora, MG. 2014-2019"
          description="The course had more emphasis in Signal Processing, and I used it to study more computation related things, as Python and Matlab Programming."
          class="mb-2"
        ></Field>
        <Field
          company="Electronic Engineering Interchange"
          date-and-place="UBA - Buneos Aires, AR. 2019"
          description="I went for a 2 semesters interchange in Argentina whilst I developed my bachelor thesis. 
          There I studied adaptive signal processing, machine learning and computer graphics (where I've learnt Javascript)."
          class="mb-2"
        ></Field>
      </div>
      <div class="experiences">
        <FieldTitleVue title="Experiences"></FieldTitleVue>
        <Field
          company="Nelogica - Software Developer"
          date-and-place="Porto Alegre - RS, BR. 2020-(Now)"
          title="Software Developer"
          description="Nelogica is the biggest trading software company in Brazil, and has several trading platforms. 
          I was hired in 2020 to work in the Web Platforms as a Javascript developer, creating and improving our trading dashboards.
          Now I work more on performance related subjects inside the Web Platforms and leading the transition to Typescript."
          class="mb-2"
        ></Field>
        <Field
          company="PSA - Intern"
          date-and-place="Buenos Aires, AR. 2019"
          description="I've work for two months as a Maintenance Intern in PSA, helping in the control of spare parts. 
          Unfortunately, I had some issues issues with working papers and could not continue more time."
          class="mb-2"
        ></Field>
      </div>
      <div class="projects">
        <FieldTitleVue title="Relevant Projects"></FieldTitleVue>
        <Field
          :company="'Bachelor Thesis'"
          date-and-place="2019"
          description="In my thesis I implemented adaptive filtering algorithms from papers with Matlab to analyse harmonics from the electrical energy network. 
           In this work I had the opportunity to work with some advanced Linear Algebra to implement the computations.
           I wrote it while I was in the interchange in Argentina."
          class="mb-2"
        ></Field>
        <Field
          :company="'Personal Website'"
          description="I've built my personal website some time ago, 
          it is a little bit outdated but it has some interesting 3D animations and computer Graphics related things,
          wich I like to learn in my spare time."
          class="mb-2"
        ></Field>
        <Field
          :company="'Blogs And Small Articles'"
          description="When I'm learning something new, I like to write about it. 
          So I have A Medium with some engineering, Math and programming related articles. I also have some content on Linkedin."
          class="mb-2"
        ></Field>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Field from '../components/CV/CVField.vue';
import FieldTitleVue from '../components/CV/FieldTitle.vue';
import GitHub from '../assets/github-brands.svg';
import Globe from '../assets/globe-solid.svg';
import Envelope from '../assets/envelope-solid.svg';
import Location from '../assets/location-pin-solid.svg';
import Mobile from '../assets/mobile-solid.svg';
// import News from '../assets/newspaper-solid.svg';
import Linkedin from '../assets/linkedin-brands.svg';
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Lato&display=swap');
.cv-container {
  font-family: 'Lato', sans-serif;
  width: 800px;
  height: 1131px;
  background-color: rgb(248, 244, 237);
  padding: 40px 70px 50px 70px;
}
.cv-icon {
  height: 16px;
  margin: 2px;
}
.icons-container {
  display: grid;
  font-size: 11px;
  grid-template-columns: min-content min-content min-content;
  column-gap: 20px;
}
</style>
