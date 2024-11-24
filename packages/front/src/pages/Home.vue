<script setup lang="ts">
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
import { CVLinks } from '../components/CV/glmachadoCVData';
import Kite from '../components/kite/Kite.vue';
</script>

<template>
  <NavBar></NavBar>
  <main
    class="flex flex-col items-center px-2 md:px-10 text-text-prime pb-10 max-w-[1420px] w-full"
  >
    <section
      class="w-full min-h-[calc(100vh-96px)] flex flex-col relative touch-pan-y"
      id="landing"
    >
      <Kite class="absolute top-0 left-0 z-10"></Kite>
      <div class="grow flex flex-col justify-center py-10">
        <div class="w-full flex justify-between">
          <div class="">
            <label for="" class="text-text-label text-2xl font-semibold">I am</label>
            <h1 class="md:text-6xl text-3xl leading-[1.8] font-extrabold">
              Gabriel Machado
            </h1>
            <h1 class="md:text-6xl text-3xl font-extrabold">Cross-platform Developer</h1>
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
          <Button class="flex items-center gap-2"><span>About Me</span> <ADown /></Button>
        </a>
      </div>
    </section>
    <section id="about-me" class="w-full pt-20">
      <div
        class="flex justify-between flex-wrap gap-4 [&_a]:text-prime-600 [&_a]:underline"
      >
        <div class="max-w-[560px] min-w-[380px] flex flex-col gap-7 text-xl">
          <p>
            In 2020 I graduated in Electrical Engineering at UFJF. But even before that,
            throughout my whole studies I was always deeply interested in science,
            mathemathics and technology.
          </p>
          <p>
            I started programming with relays and logic gates in technical school, and
            then with microcontrollers and MATLAB in college. My
            <a :href="CVLinks.bachelorThesis">bachelor's thesis</a>
            was about signal processing techniques to identify harmonic distortion in
            power systems, implementing signal processing Algorithms in MATLAB, and I am
            quite proud of that.
          </p>
          <p>
            After graduating I started working at Nelogica, where I fell in love with web
            development and graphics programming in the
            <a :href="CVLinks.profitWeb" target="_blank">Profit Web</a> project. Right
            after I got some familiarity with the projects I started to work on
            performance improvements for the aplication and bringing new technologies to
            the stack.
          </p>
          <p>
            Nowdays we manage codebases that target web,
            <a :href="CVLinks.profitChartAndroid" target="_blank">Android</a>,
            <a :href="CVLinks.IOS" target="_blank">IOS</a> and
            <a :href="CVLinks.profitChartMacOS" target="_blank">macOS</a>, with hundreds
            of thousands of active users, trading billions of reais in stocks every day in
            the brazilian, foring market and crypto exchanges.
          </p>
          <p>
            As a side project I am developing a game called
            <a :href="CVLinks.archpelagus" target="_blank">Archpelagus</a>, a Real Time
            Strategy game. I am also always testing with cutting edge web technologies,
            like Webassembly and WebGPU, and from time to time I write about it.
          </p>
        </div>
        <div class="max-w-[600px] grow">
          <h3 class="text-xl text-text-label font-semibold pb-4">Experiences</h3>
          <div class="flex flex-col gap-4">
            <Experience
              company="Nelogica"
              date="2024 - Now"
              description="In late 2024 I became tech lead of the Profit Web team to focus again on the Profit Web project as well as web front end libraries and APIs."
              title="Tech Lead"
              :tags="['Web', 'FrontEnd']"
            ></Experience>
            <Experience
              company="Nelogica"
              date="2023 - 2024"
              title="Software Developer IV"
              description="In 2023 I moved to Porto Alegre to work in office with the mobile team using our typescript codebase to target the mobile platforms. Today we have hundreds of thousands active users of the Profit Android and IOS apps monthly."
              :tags="['iOS', 'Android', 'CapacitorJS']"
            ></Experience>
            <Experience
              company="Nelogica"
              date="2022 - 2023"
              title="Software Developer III"
              description="In late 2022 we developed the Profit Mac project using web technologies and electron, briging our products to thousands of MacOS users."
              :tags="['Electron', 'MacOS']"
            ></Experience>
            <Experience
              company="Nelogica"
              date="2021 - 2022"
              title="Software Developer II"
              description="As I acquired more skills and experience, I started to guide my work towards the aplication performance and developer tools.
              In this year I introduced typescript to the web projects."
              :tags="['Typescript', 'VueJS', 'WebSockets']"
            ></Experience>
            <Experience
              company="Nelogica"
              date="2020 - 2021"
              title="Software Developer I"
              description="In my first year at Nelogica, I worked on the Homebroker and ProfitWeb projects, using vuejs. The homebroker is a trading platform used by thousands of traders every day in several brazilian exchanges."
              :tags="['Javascript', 'HTML', 'CSS']"
            ></Experience>
            <Experience
              company="PSA (Peugeot Citroën)"
              date="2019"
              title="Engeenier Intern"
              description="I worked in the maintenance department, where I helped with spare parts management and maintenance planning."
              :tags="['Excel']"
            ></Experience>
          </div>
        </div>
      </div>
      <div class="flex justify-center w-full pt-10">
        <a href="#projects">
          <Button class="flex items-center gap-2"><span>Projects</span> <ADown /></Button>
        </a>
      </div>
    </section>
    <section id="projects" class="py-20">
      <div class="w-full pb-10">
        <label class="text-text-label text-lg font-bold">Personal projects</label>
        <h2 class="font-bold text-5xl mt-5">What I've been working on</h2>
      </div>
      <div
        class="grid xl:grid-cols-[1fr_1fr] grid-cols-1 gap-2"
        style="grid-auto-rows: 1fr"
      >
        <ProjectPresentation
          title="Archpelagus"
          description="This is an RTS game like Age of Empites, but with boats and islands. 
          My backend is written in rust and the frontend in typescript. 
          I am using webassembly to run the game logic in the browser and websockets to communicate with the server. 
          Quite fancy stuff!"
          class="rounded-md row-span-2"
          :tags="['WebgGL', 'WebAssembly', 'Rust', 'ThreeJS', 'WebSockets']"
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
    <section id="contact" class="w-full">
      <div
        class="min-h-[300px] w-full rounded-lg p-10 flex gap-10 items-start flex-wrap border border-text-prime bg-gradient-to-br from-prime-100 to-prime-0 to-50%"
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
        <img :src="perfil" class="rounded-3xl w-[200px] aspect-square grayscale h-auto" />
      </div>
    </section>
  </main>
</template>

<style></style>
