<script setup lang="ts"></script>

<template>
  <div class="w-screen my-container h-screen gradient-color overflow-hidden">
    <div
      class="w-full h-full min-h-screen px-3 py-2 text-white flex justify-center overflow-y-auto overflow-x-hidden"
    >
      <div class="grow-0 shrink basis-[800px] overflow-x-hidden h-max">
        <slot></slot>
      </div>
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
