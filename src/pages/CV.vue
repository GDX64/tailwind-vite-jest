<template>
  <div class="flex w-full justify-center items-center">
    <div class="cv-container">
      <header class="flex items-center flex-col">
        <h1 class="text-sky-600 text-3xl">Gabriel Eduardo de Lima Machado</h1>
        <div class="flex justify-between w-96">
          <div>site</div>
          <div>phone</div>
          <div>email</div>
          <div>github</div>
        </div>
        <div class="text-gray-500">adrress</div>
      </header>
      <div class="education">
        <FieldTitleVue title="Education"></FieldTitleVue>
        <Field
          :company="'Técnico em Eletromecânica'"
          date-and-place="ETPC - Volta Redonda, RJ"
          class="mb-2"
        ></Field>
        <Field
          company="Electronic Engeneering"
          date-and-place="UFJF - Juiz de fora, MG"
          class="mb-2"
        ></Field>
      </div>
      <div class="experiences">
        <FieldTitleVue title="Experiences"></FieldTitleVue>
        <Field
          :company="'PSA'"
          description="blabla"
          :title="'Intern'"
          date-and-place="Buenos Aires"
          class="mb-2"
        ></Field>
        <Field
          :company="'PSA'"
          description="blabla"
          :title="'Intern'"
          date-and-place="Buenos Aires"
          class="mb-2"
        ></Field>
      </div>
      <div class="projects">
        <FieldTitleVue title="Relevant Projects"></FieldTitleVue>
        <Field
          :company="'My Bachelor Thesis'"
          date-and-place="2019"
          description="In my thesis I implemented adaptive filtering algorithms from papers with Matlab to analyse harmonics from the electrical energy network"
          class="mb-2"
        ></Field>
      </div>
      <div class="skills">
        <FieldTitleVue title="Skills"></FieldTitleVue>
        <Field :company="'Programing'" description="Rust" class="mb-2"></Field>
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
  padding: 80px 70px 50px 70px;
}
</style>
