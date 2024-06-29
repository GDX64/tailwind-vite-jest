<script setup lang="ts"></script>

<template>
  <div class="my-bg-styles flex flex-col items-center h-screen">
    <nav
      class="h-10 px-2 w-full border-b-2 border-sec-800 bg-sec-800/50 mb-3 sticky top-0 backdrop-blur-sm"
    >
      <ul class="ml-auto flex items-center h-full text-x">
        <li><a href="/">γ Home</a></li>
      </ul>
    </nav>
    <div class="max-w-[900px] w-full px-2 rounded-sm py-2">
      <slot></slot>
    </div>
  </div>
</template>

<style>
.my-bg-styles h1,
h2,
h3,
h4,
h5 {
  @apply text-prime-200;
}

.my-bg-styles {
  @apply text-prime-50 bg-sec-950;
  font-family: 'Afacad', sans-serif;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  height: 100%;
  min-width: 100vw;
  min-height: 100vh;
}
</style>
