<script setup lang="ts"></script>

<template>
  <div class="gradient-color fixed top-0 w-screen h-screen z-[-1]"></div>
  <div
    class="w-screen my-container min-h-screen px-3 text-white flex flex-col items-center overflow-y-auto overflow-x-hidden"
  >
    <nav class="h-10 w-full border-b-2 border-gray-400 mb-3">
      <ul class="ml-auto flex items-center h-full">
        <div class="mr-5">Projects</div>
        <div>About</div>
      </ul>
    </nav>
    <div class="max-w-[500px] overflow-hidden h-max">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.gradient-color {
  background-image: linear-gradient(to top, rgb(43, 0, 45), rgb(0, 0, 0));
}

.my-container {
  max-width: 100vw;
}
</style>
