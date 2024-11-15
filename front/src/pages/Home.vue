<script setup lang="ts">
import Linkedin from '../assets/linkedin-home.svg?component';
import Github from '../assets/github-home.svg?component';
import Instagram from '../assets/instagran-home.svg?component';
import ADown from '../assets/arrow-down.svg?component';
import Button from '../components/Button.vue';
import NavBar from '../components/NavBar.vue';
import Experience from '../components/Experience.vue';
import perfil from '../assets/perfil.jfif?url';
import ProjectPresentation from '../components/ProjectPresentation.vue';
import archpelagusURL from '../assets/project_images/archpelagus_print.jpg?url';
import archpelagusURL2 from '../assets/project_images/boat_render.jpg?url';
import quadTreeURL from '../assets/project_images/quad_tree.png?url';
import wasmChart from '../assets/project_images/wasm_chart.png?url';
import triangleURL from '../assets/project_images/triangle_example.ppm?url';
import birdsURL from '../assets/project_images/birds_example.jpg?url';
import LinkedinRound from '../components/Contacts/LinkedinRound.vue';
import GithubRound from '../components/Contacts/GithubRound.vue';
import InstagramRound from '../components/Contacts/InstagramRound.vue';
</script>

<template>
  <NavBar />
  <div class="flex flex-col items-center px-2 md:px-10 text-text-prime pb-10">
    <div class="max-w-[1420px] w-full">
      <section class="w-full min-h-[calc(100vh-96px)] flex flex-col" id="landing">
        <div class="grow flex flex-col justify-center py-10">
          <div class="w-full flex justify-between">
            <div class="">
              <label for="" class="text-text-label text-2xl font-semibold">I am</label>
              <h1 class="md:text-6xl text-3xl leading-[1.8] font-extrabold">
                Gabriel Machado
              </h1>
              <h1 class="md:text-6xl text-3xl font-extrabold">
                Cross-platform Developer
              </h1>
            </div>
            <div class="flex flex-col justify-between md:visible invisible">
              <LinkedinRound></LinkedinRound>
              <GithubRound></GithubRound>
              <InstagramRound></InstagramRound>
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
        <div class="flex justify-between flex-wrap gap-4">
          <div class="max-w-[560px] min-w-[380px] flex flex-col gap-7 text-xl">
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
                :tags="['iOS', 'Android', 'CapacitorJS']"
              ></Experience>
              <Experience
                company="Nelogica"
                date="2022 - 2023"
                title="Software Developer III"
                :tags="['Electron', 'MacOS']"
              ></Experience>
              <Experience
                company="Nelogica"
                date="2021 - 2022"
                title="Software Developer II"
                :tags="['TypeScript', 'Webpack', 'WebPlatform']"
              ></Experience>
              <Experience
                company="Nelogica"
                date="2020 - 2021"
                title="Software Developer I"
                :tags="['Javascript', 'HTML', 'CSS']"
              ></Experience>
              <Experience
                company="PSA (Peugeot Citroën)"
                date="2019"
                title="Engeenier Intern"
                :tags="['Excel']"
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
        <div class="w-full pb-10">
          <label class="text-text-label text-lg font-bold">Projects</label>
          <h2 class="font-bold text-5xl mt-5">What I've been working on</h2>
        </div>
        <div
          class="grid xl:grid-cols-[1fr_1fr] grid-cols-1 gap-2"
          style="grid-auto-rows: 1fr"
        >
          <ProjectPresentation
            title="Archpelagus"
            description="This is an RTS game like Age of Empites, but with boats and islands."
            class="rounded-md row-span-2"
            :tags="['WebgGL', 'WebAssembly', 'Rust', 'ThreeJS']"
            :imgURL="[archpelagusURL, archpelagusURL2]"
            url="https://archpelagus.glmachado.com"
          ></ProjectPresentation>
          <ProjectPresentation
            title="Spatial indexing"
            description="Some approaches to spatial indexing, wich is a technique to optimize searchs in space widly used in games like my own."
            :tags="['Algorithms', 'Canvas2D', 'Typescript']"
            :imgURL="quadTreeURL"
            url="/space-index"
          ></ProjectPresentation>
          <ProjectPresentation
            title="Wasm Chart"
            description="This is a chart built with rust compiled to webassembly, the idea is to visualize millions of data points at once in real time using some clever trees."
            :tags="['Algorithms', 'WebAssembly', 'Rust', 'Canvas2D']"
            :imgURL="wasmChart"
            url="/wasm-chart"
          ></ProjectPresentation>
          <ProjectPresentation
            title="More fun stuff"
            description="Random cool projects with little context I like to keep around to show to my friends."
            :tags="['WebgGL', 'WebAssembly', 'Rust', 'Typescript']"
            :imgURL="birdsURL"
            url="/fun-stuff"
          ></ProjectPresentation>
          <ProjectPresentation
            title="SIMD Rasterization"
            description="Basics with how to do SIMD with rust and compile it to webassembly. I used triangle rasterization as an example as it is highly parallelizable."
            :tags="['WebgGL', 'WebAssembly', 'Rust', 'ThreeJS']"
            :imgURL="triangleURL"
            url="/simd-rasterization"
          ></ProjectPresentation>
        </div>
      </section>
      <section id="contact" class="py-10">
        <div
          class="min-h-[300px] w-full border-2 border-text-prime rounded-lg p-10 flex gap-10 items-start bg-prime-100 flex-wrap"
        >
          <div class="flex flex-col gap-6 w-min grow">
            <h2 class="font-bold text-3xl">Interested? Let's get in touch!</h2>
            <p class="font-semibold max-w-[600px]">
              If you are interested in my work, or just want to say hi and talk about
              programming, feel free to send me a message. I'd be happy to hear from you!
            </p>
            <div class="grow"></div>
            <div class="flex gap-4">
              <LinkedinRound></LinkedinRound>
              <GithubRound></GithubRound>
              <InstagramRound></InstagramRound>
            </div>
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
