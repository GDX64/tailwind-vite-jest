<script setup lang="ts">
import Linkedin from '../assets/linkedin-home.svg?component';
import Github from '../assets/github-home.svg?component';
import Instagram from '../assets/instagran-home.svg?component';
import ADown from '../assets/arrow-down.svg?component';
import Button from '../components/Button.vue';
import NavBar from '../components/NavBar.vue';
import Experience from '../components/Experience.vue';
import perfil from '../assets/perfil.jfif?url';
</script>

<template>
  <NavBar />
  <div class="flex flex-col items-center px-10 text-text-prime pb-10">
    <div class="max-w-[1420px] w-full">
      <section class="w-full min-h-[calc(100vh-96px)] flex flex-col" id="landing">
        <div class="grow flex flex-col justify-center py-10">
          <div class="w-full flex justify-between">
            <div class="">
              <label for="" class="text-text-label text-2xl font-semibold">I am</label>
              <h1 class="text-6xl leading-[1.8] font-extrabold">Gabriel Machado</h1>
              <h1 class="text-6xl font-extrabold">Cross-platform Developer</h1>
            </div>
            <div class="flex flex-col justify-between">
              <Linkedin
                class="hover:text-hover hover:scale-105 transition-all"
              ></Linkedin>
              <Github class="hover:text-hover hover:scale-105 transition-all"></Github>
              <Instagram
                class="hover:text-hover hover:scale-105 transition-all"
              ></Instagram>
            </div>
          </div>
        </div>

        <div class="flex justify-center w-full pb-16">
          <a href="#about-me">
            <Button class="flex items-center gap-2"
              ><span>About Me</span> <ADown
            /></Button>
          </a>
        </div>
      </section>
      <section id="about-me" class="w-full py-10">
        <div class="flex justify-between">
          <div class="max-w-[560px] flex flex-col gap-7 text-xl">
            <p>
              Electrical Engineer turned Software Developer with a specialization in
              cross-platform app development for iOS, Android, macOS, and web
              environments.
            </p>
            <p>
              Proficient in TypeScript, Electron, and CapacitorJS, I bring a focus on
              creating efficient, scalable, and user-centric software solutions tailored
              to the trading industry.
            </p>
            <p>
              My approach combines technical precision with a commitment to delivering
              seamless, high-performance applications that elevate the user experience
              across platforms.
            </p>
          </div>
          <div class="w-[400px]">
            <h3 class="text-xl text-text-label font-semibold pb-4">Experiences</h3>
            <div class="flex flex-col gap-8">
              <Experience
                company="Nelogica"
                date="2023 - Now"
                title="Software Developer IV"
                :tags="['TypeScript', 'Electron', 'CapacitorJS']"
              ></Experience>
              <Experience
                company="Nelogica"
                date="2023 - Now"
                title="Software Developer IV"
                :tags="['TypeScript', 'Electron', 'CapacitorJS']"
              ></Experience>
              <Experience
                company="Nelogica"
                date="2023 - Now"
                title="Software Developer IV"
                :tags="['TypeScript', 'Electron', 'CapacitorJS']"
              ></Experience>
              <Experience
                company="Nelogica"
                date="2023 - Now"
                title="Software Developer IV"
                :tags="['TypeScript', 'Electron', 'CapacitorJS']"
              ></Experience>
            </div>
          </div>
        </div>
        <div class="flex justify-center w-full pt-10">
          <a href="#projects">
            <Button class="flex items-center gap-2"
              ><span>Projects</span> <ADown
            /></Button>
          </a>
        </div>
      </section>
      <section id="projects" class="py-10">
        <div class="h-[1000px] w-full">
          <label class="text-text-label text-lg font-bold">Projects</label>
          <h2 class="font-bold text-5xl mt-5">What I've been working on</h2>
        </div>
      </section>
      <section id="contact" class="py-10">
        <div
          class="h-[300px] w-full border-2 border-text-prime rounded-lg p-10 flex gap-10 items-start bg-prime-200"
        >
          <div class="flex flex-col gap-6">
            <h2 class="font-bold text-3xl">Interested? Let's get in touch!</h2>
            <p class="font-semibold">
              If you are interested in my work, or just want to say hi and talk about
              programming, feel free to send me a message. I'd be happy to hear from you!
            </p>
          </div>
          <img
            :src="perfil"
            class="rounded-3xl w-[200px] aspect-square grayscale h-auto"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style></style>
