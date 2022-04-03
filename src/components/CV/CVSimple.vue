<template>
  <div class="flex w-full justify-center items-center">
    <div class="cv-container">
      <header class="flex items-center flex-col text-sm">
        <h1 class="text-sky-600 text-3xl mb-2">{{ cvData.name }}</h1>
        <h2 class="text-sky-600 text-xl mb-4">{{ cvData.title }}</h2>
        <div class="icons-container mb-2">
          <template v-for="userInfo of cvData.arrUserInfo">
            <div class="flex">
              <component :is="componentMap[userInfo.icon]" class="cv-icon"></component
              ><a :href="userInfo.link" v-if="userInfo.link">{{ userInfo.text }}</a>
              <span v-else class="whitespace-nowrap">{{ userInfo.text }}</span>
            </div>
          </template>
        </div>
      </header>
      <div class="education">
        <FieldTitleVue title="Education"></FieldTitleVue>
        <template v-for="data of cvData.education">
          <Field
            :main="data.title"
            :date-and-place="data.schoolPlaceDate"
            :description="data.description"
            class="mb-2"
          ></Field>
        </template>
      </div>
      <div class="experiences">
        <FieldTitleVue title="Experiences"></FieldTitleVue>
        <Field
          main="Nelogica - Software Developer"
          date-and-place="Porto Alegre - RS, BR. 2020-(Now)"
          title="Software Developer"
          description="Nelogica is the biggest trading software company in Brazil, and has several trading platforms. 
          I was hired in 2020 to work in the Web Platforms as a Javascript developer, creating and improving our trading dashboards.
          Now I work more on performance related subjects inside the Web Platforms and the transition to Typescript."
          class="mb-2"
        ></Field>
        <Field
          main="PSA - Intern"
          date-and-place="Buenos Aires, AR. 2019"
          description="I've worked for two months as a Maintenance Intern in PSA, helping in the control of spare parts."
          class="mb-2"
        ></Field>
      </div>
      <div class="projects">
        <FieldTitleVue title="Relevant Projects"></FieldTitleVue>
        <template v-for="project of cvData.projects">
          <Field
            :main="project.title"
            :date-and-place="project.schoolPlaceDate"
            description=""
            class="mb-2"
          >
            <LinkProcess class="text-with-link" :text="project.description"></LinkProcess>
          </Field>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Field from './CVField.vue';
import FieldTitleVue from './FieldTitle.vue';
import GitHub from '../../assets/github-brands.svg';
import Globe from '../../assets/globe-solid.svg';
import Envelope from '../../assets/envelope-solid.svg';
import Location from '../../assets/location-pin-solid.svg';
import Mobile from '../../assets/mobile-solid.svg';
import Linkedin from '../../assets/linkedin-brands.svg';
import { Icons } from './SimpleCVTypes';
import LinkProcess from './LinkProcess';

defineProps<{ cvData: CVData }>();

const componentMap = {
  [Icons.Globe]: Globe,
  [Icons.Mobile]: Mobile,
  [Icons.GitHub]: GitHub,
  [Icons.Envelope]: Envelope,
  [Icons.Location]: Location,
  [Icons.Linkedin]: Linkedin,
};

interface CVData {
  name: string;
  title: string;
  arrUserInfo: { text: string; icon: Icons; link?: string }[];
  education: { schoolPlaceDate: string; title: string; description?: string }[];
  projects: { schoolPlaceDate?: string; title: string; description?: string }[];
}
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
  margin-right: 5px;
}
.icons-container {
  display: grid;
  font-size: 11px;
  grid-template-columns: min-content min-content min-content;
  column-gap: 20px;
}
.text-with-link a {
  @apply text-sky-600;
}
</style>
