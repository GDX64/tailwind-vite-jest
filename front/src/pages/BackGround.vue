<script setup lang="ts">
import Linkedin from '../assets/linkedin-brands.svg?component';
import Github from '../assets/github-brands.svg?component';
import NavBar from '../components/NavBar.vue';
</script>

<template>
  <NavBar></NavBar>
  <div class="my-bg-styles flex flex-col items-center h-full">
    <div class="max-w-[900px] w-full px-2 rounded-sm py-2 grow">
      <slot></slot>
    </div>
    <div
      class="self-end bg-bg-sec w-full min-h-12 flex items-center px-2 mt-4 justify-center"
    >
      <div class="max-w-[900px] w-full flex gap-8">
        <a href="https://www.linkedin.com/in/gabriel-e-l-machado">
          <Linkedin class="w-8 h-8 fill-prime-500"></Linkedin>
        </a>
        <a href="https://github.com/GDX64/">
          <Github class="w-8 h-8 fill-prime-500"></Github>
        </a>
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
