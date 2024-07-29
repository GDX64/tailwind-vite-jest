<script setup lang="ts">
import BackGround from './BackGround.vue';
</script>

<template>
  <BackGround>
    <h1 class="text-2xl mb-4">Trust me, I'm an engineer</h1>
    <p class="text-lg mb-4">Things that I'm exploring:</p>
    <ul class="flex flex-col gap-2 text-xl text-high-300 underline capitalize">
      <li>
        <a href="/wasm-chart">Wasm Chart</a>
      </li>
      <li>
        <a href="/gravity">Gravity</a>
      </li>
      <li>
        <a href="/projection">Projections</a>
      </li>
      <li>
        <a href="/libtest">Test render</a>
      </li>
      <li>
        <a href="/testWorker">Test worker</a>
      </li>
      <li>
        <a href="/simd-rasterization">SIMD rasterization</a>
      </li>
      <li>
        <a href="/cv">CV Online</a>
      </li>
      <li>
        <a href="/CV_Gabriel_Machado.pdf" download="CV_Gabriel_Machado.pdf"
          >Download CV</a
        >
      </li>
      <li>
        <a href="https://game.glmachado.com/static/editor/index.html"
          >GAME - Archpelagus 🕹️</a
        >
      </li>
    </ul>
  </BackGround>
</template>

<style></style>
