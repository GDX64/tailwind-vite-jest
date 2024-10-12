<script setup lang="ts">
import Linkedin from '../assets/linkedin-brands.svg?component';
import Github from '../assets/github-brands.svg?component';
</script>

<template>
  <div class="my-bg-styles flex flex-col items-center h-full">
    <nav
      class="h-12 min-h-12 px-2 w-full border-b-2 border-sec-800 bg-sec-800/50 mb-3 sticky top-0 backdrop-blur-sm flex justify-center"
    >
      <ul class="items-center h-full text-x flex gap-8 max-w-[900px] w-full">
        <li><a href="/">γ Home</a></li>
      </ul>
    </nav>
    <div class="max-w-[900px] w-full px-2 rounded-sm py-2 grow">
      <slot></slot>
    </div>
    <div
      class="self-end bg-sec-900 w-full min-h-12 flex items-center px-2 mt-4 justify-center"
    >
      <div class="max-w-[900px] w-full flex gap-8">
        <a href="https://www.linkedin.com/in/gabriel-e-l-machado">
          <Linkedin class="w-8 h-8 fill-emerald-300"></Linkedin>
        </a>
        <a href="https://github.com/GDX64/">
          <Github class="w-8 h-8 fill-emerald-300"></Github>
        </a>
      </div>
    </div>
  </div>
</template>

<style>
.my-bg-styles h1,
h2,
h3,
h4,
h5 {
  @apply text-prime-200;
}

.my-bg-styles {
  @apply text-prime-50 bg-sec-950;
  font-family: 'Afacad', sans-serif;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  height: 100%;
  min-width: 100vw;
  min-height: 100vh;
}
</style>
