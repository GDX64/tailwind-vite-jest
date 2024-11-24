<script setup lang="ts">
import NavBar from '../components/NavBar.vue';
import LinkedinRound from '../components/Contacts/LinkedinRound.vue';
import GithubRound from '../components/Contacts/GithubRound.vue';
import InstagramRound from '../components/Contacts/InstagramRound.vue';
</script>

<template>
  <NavBar></NavBar>
  <div class="my-bg-styles flex flex-col items-center h-full">
    <div class="max-w-[900px] w-full px-2 rounded-sm py-2 grow">
      <slot></slot>
    </div>
    <div
      class="self-end bg-bg-100 w-full min-h-12 flex items-center px-2 mt-4 justify-center py-2"
    >
      <div class="max-w-[900px] w-full flex gap-8">
        <LinkedinRound></LinkedinRound>
        <GithubRound></GithubRound>
        <InstagramRound></InstagramRound>
      </div>
    </div>
  </div>
</template>

<style>
.my-bg-styles {
  font-family: 'Afacad', sans-serif;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  height: 100%;
  min-height: 100vh;
}
</style>
