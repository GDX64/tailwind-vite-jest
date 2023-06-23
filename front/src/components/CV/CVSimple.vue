<template>
  <div
    class="flex w-full justify-center items-center leading-relaxed"
    tabindex="-1"
    @keydown="onkeydown"
  >
    <div class="cv-container px-4 py-4 flex flex-col">
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
      <div v-for="(category, categoryIndex) of cvData.categories">
        <FieldTitleVue :title="category.title"></FieldTitleVue>
        <template v-for="(data, fieldIndex) of category.fields">
          <FieldVue
            :main="data.title"
            :date-and-place="data.schoolPlaceDate"
            :description="data.description"
            @update:main="onUpdate($event, categoryIndex, fieldIndex, 'title')"
            @update:dateAndPlace="
              onUpdate($event, categoryIndex, fieldIndex, 'schoolPlaceDate')
            "
            @update:description="
              onUpdate($event, categoryIndex, fieldIndex, 'description')
            "
            class="mb-2"
          ></FieldVue>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import FieldVue from './CVField.vue';
import FieldTitleVue from './FieldTitle.vue';
import GitHub from '../../assets/github-brands.svg';
import Globe from '../../assets/globe-solid.svg';
import Envelope from '../../assets/envelope-solid.svg';
import Location from '../../assets/location-pin-solid.svg';
import Mobile from '../../assets/mobile-solid.svg';
import Linkedin from '../../assets/linkedin-brands.svg';
import { Field, Icons } from './SimpleCVTypes';
import { injectCV } from './CVStore';

const { data: cvData, doUndo, undo, doAgain } = injectCV();

const componentMap = {
  [Icons.Globe]: Globe,
  [Icons.Mobile]: Mobile,
  [Icons.GitHub]: GitHub,
  [Icons.Envelope]: Envelope,
  [Icons.Location]: Location,
  [Icons.Linkedin]: Linkedin,
};

function onUpdate(value: string, category: number, field: number, kind: keyof Field) {
  const valueNow = cvData.value.categories[category].fields[field][kind];
  doUndo({
    doFn: (cv) => {
      cv.categories[category].fields[field][kind] = value;
    },
    undo: (cv) => {
      if (kind !== 'title') {
        cv.categories[category].fields[field][kind] = valueNow;
      } else if (valueNow != null) {
        cv.categories[category].fields[field][kind] = valueNow;
      }
    },
  });
}

function onkeydown(event: KeyboardEvent) {
  if (event.ctrlKey && event.key === 'z') {
    undo();
  }
  if (event.ctrlKey && event.key === 'y') {
    doAgain();
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Lato&display=swap');
.cv-container {
  font-family: 'Lato', sans-serif;
  width: 800px;
  height: 1131px;
  background-color: rgb(248, 244, 237);
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
