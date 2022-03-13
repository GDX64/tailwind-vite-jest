<template>
  <div class="flex w-full justify-center items-center">
    <div class="cv-container">
      <header class="flex items-center flex-col">
        <h1 class="text-sky-600 text-3xl">Gabriel Eduardo de Lima Machado</h1>
        <div class="flex justify-between w-96">
          <div>glmachado.herokuapp.com</div>
          <div>phone</div>
          <div>email</div>
          <div>github</div>
        </div>
        <div class="text-gray-500">adrress</div>
      </header>
      <div class="education">
        <FieldTitleVue title="Education"></FieldTitleVue>
        <Field
          company="Electro-Mechanical Technician"
          date-and-place="ETPC - Volta Redonda, RJ"
          class="mb-2"
        ></Field>
        <Field
          company="Electronic Engeneering Bachelor"
          date-and-place="UFJF - Juiz de fora, MG. 2014-2019"
          description="The course had more enphasis in Signal Processing, and I used it to study more computation related things, as Python and Matlab Programming."
          class="mb-2"
        ></Field>
        <Field
          company="Electronic Engeneering Interchange"
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
          Now I work more on performance related subjects inside the Web Platformns and leading the transition to Typescript."
          class="mb-2"
        ></Field>
        <Field
          company="PSA - Intern"
          date-and-place="Buenos Aires, AR. 2019"
          description="I've work for two months as an Maintenance Intern in PSA, helping in the control of spare parts. 
          Unfortunatly, I had some issues issues with woking papers and could not continue more time."
          class="mb-2"
        ></Field>
      </div>
      <div class="projects">
        <FieldTitleVue title="Relevant Projects"></FieldTitleVue>
        <Field
          :company="'Bachelor Thesis'"
          date-and-place="2019"
          description="In my thesis I implemented adaptive filtering algorithms from papers with Matlab to analyse harmonics from the electrical energy network. 
           In this work I had the oportunity to work with some advanced Linear Algebra to implement the computations.
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
      </div>
      <div class="skills">
        <FieldTitleVue title="Skills"></FieldTitleVue>
        <Field
          :company="'Web development'"
          description="I have solid skills with Javascript/Typescript and the other Browser related technologies"
          class="mb-2"
        ></Field>
        <Field
          company="Scientific Programming"
          description="At college I woked more with Matlab to implement DSP algorithms, but I also did some Python and Julia Programing (you can find it in my github)"
          class="mb-2"
        ></Field>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Field from '../components/CV/CVField.vue';
import FieldTitleVue from '../components/CV/FieldTitle.vue';
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Lato&display=swap');
.cv-container {
  font-family: 'Lato', sans-serif;
  width: 800px;
  height: 1131px;
  background-color: rgb(250, 241, 227);
  padding: 40px 70px 50px 70px;
}
</style>
