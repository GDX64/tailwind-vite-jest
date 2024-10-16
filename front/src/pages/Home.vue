<script setup lang="ts">
import BackGround from './BackGround.vue';
</script>

<template>
  <BackGround>
    <h2 class="text-xl mb-4">The archpelagus saga</h2>
    <ul class="flex flex-col gap-4 text-xl [&_a]:text-high-300 [&_a]:underline">
      <li>
        <a href="https://archpelagus.glmachado.com/">GAME - Archpelagus 🚢</a>
        <p>Online Real Time Strategy game (kind of age of empires, but with boats)</p>
      </li>
      <li>
        <a href="/space-index">Spatial Indexing for my game</a>
        <p>Some aproaches to space indexing for games</p>
      </li>
    </ul>
    <div class="border-t-2 my-8 border-sec-700"></div>
    <h2 class="text-xl mb-4">Things with a bit of context:</h2>
    <ul class="flex flex-col gap-4 text-xl [&_a]:text-high-300 [&_a]:underline">
      <li>
        <a href="/wasm-chart">Wasm Chart</a>
        <p>
          This is a chart made with rust, compiled to webassembly, it has 1M points but
          uses a range tree to aggregate the data realtime as you move it around.
        </p>
      </li>
      <li>
        <a href="/simd-rasterization">SIMD Rasterization</a>
        <p>Basics of how to do SIMD with rust on WASM</p>
      </li>
      <li>
        <a href="/cv">CV Online</a>
      </li>
      <li>
        <a href="/CV_Gabriel_Machado.pdf" download="CV_Gabriel_Machado.pdf"
          >Download CV</a
        >
      </li>
    </ul>
    <div class="border-t-2 my-8 border-sec-700"></div>
    <h2 class="text-xl mb-4">
      Things with no context I keep here just to show to my friends:
    </h2>
    <ul class="flex flex-col gap-5 text-xl [&_a]:text-high-300 [&_a]:underline">
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
        <a href="/stack">Stack boxes</a>
      </li>
    </ul>
  </BackGround>
</template>

<style></style>
