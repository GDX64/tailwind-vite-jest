<script setup lang="ts"></script>

<template>
  <div
    class="fake-bg fixed w-screen h-screen from-prime-800 to-prime-900 bg-gradient-to-tr"
  >
    <div
      class="ball rounded-full w-52 h-[800px] from-red-700/10 to-purple-500/10 bg-gradient-to-t rotate-45 absolute top-1/3 left-1/5"
    ></div>
    <div
      class="ball rounded-full w-52 h-[800px] to-red-700/10 from-purple-500/10 bg-gradient-to-t -rotate-45 absolute top-1/5 left-3/4"
    ></div>
  </div>
  <div
    class="main-container text-sec-300 min-w-full min-h-screen backdrop-blur-3xl pl-36 pt-36"
  >
    <slot></slot>
  </div>
</template>

<style>
.fake-bg {
  z-index: -1;
}
</style>
