<script setup lang="ts">
import BackGround from './BackGround.vue';
</script>

<template>
  <BackGround>
    <h1 class="text-2xl mb-4">Trust me, I'm an engineer</h1>
    <ul class="flex flex-col gap-2 tex-lg text-high-200 underline">
      <li>
        <a href="/base64">base64</a>
      </li>
      <li>
        <a href="/wasm-chart">Wasm Chart</a>
      </li>
      <li>
        <a href="/text-quality">Text render speed</a>
      </li>
      <li>
        <a href="/gravity">Gravity</a>
      </li>
      <li>
        <a href="/cv">CV</a>
      </li>
      <li>
        <a href="/projection">Projections</a>
      </li>
      <li>
        <a href="/libtest">test render</a>
      </li>
      <li>
        <a href="/testWorker">test worker</a>
      </li>
      <li>
        <a href="/simd-rasterization">SIMD rasterization</a>
      </li>
    </ul>
  </BackGround>
</template>

<style></style>
