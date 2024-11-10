<script setup lang="ts">
import Button from './Button.vue';
import ADown from '../assets/arrow-down.svg?component';
import Logo from '../assets/logo.svg?component';
</script>

<template>
  <nav
    class="w-full flex justify-center px-10 py-6 sticky top-0 left-0 bg-bg-prime/75 backdrop-blur-sm"
  >
    <div class="flex w-full items-center max-w-[1720px]">
      <div class="grow">
        <a href="/#landing">
          <Logo class="hover:text-hover transition-all hover:scale-105" />
        </a>
      </div>
      <ul class="flex gap-8 items-center font-semibold">
        <li>
          <a
            class="flex gap-4 transition-colors hover:text-hover hover:underline"
            href="/#about-me"
            ><span>About Me</span> <ADown
          /></a>
        </li>
        <li>
          <a
            class="flex gap-4 transition-colors hover:text-hover hover:underline"
            href="/#projects"
            ><span>Projects</span> <ADown
          /></a>
        </li>
        <li>
          <a
            class="flex gap-4 transition-colors hover:text-hover hover:underline"
            href="/#contact"
            ><span>Contact</span> <ADown
          /></a>
        </li>
        <li><Button>My Resume</Button></li>
      </ul>
    </div>
  </nav>
</template>
