<script setup lang="ts">
import BackGround from './BackGround.vue';
import Linkedin from '../assets/linkedin-home.svg?component';
import Github from '../assets/github-home.svg?component';
import Instagram from '../assets/instagran-home.svg?component';
import ADown from '../assets/arrow-down.svg?component';
import Button from '../components/Button.vue';
import NavBar from '../components/NavBar.vue';
</script>

<template>
  <NavBar />
  <div class="flex flex-col items-center px-10 text-text-prime">
    <div class="max-w-[1420px] w-full">
      <div class="py-72 w-full flex justify-between">
        <div class="">
          <label for="" class="text-text-label text-2xl font-semibold">I am</label>
          <h1 class="text-6xl leading-[1.8] font-extrabold">Gabriel Machado</h1>
          <h1 class="text-6xl font-extrabold">Cross-platform Developer</h1>
        </div>
        <div class="flex flex-col justify-between">
          <Linkedin></Linkedin>
          <Github></Github>
          <Instagram></Instagram>
        </div>
      </div>

      <div class="flex justify-center w-full">
        <Button class="flex items-center gap-2"><span>About Me</span> <ADown /></Button>
      </div>
    </div>
  </div>
</template>

<style></style>
