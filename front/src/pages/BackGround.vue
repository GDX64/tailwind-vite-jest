<script setup lang="ts"></script>

<template>
  <div class="w-full my-bg-styles min-h-screen px-4 flex flex-col items-center">
    <nav class="h-10 w-full border-b-2 border-prime-800 mb-3">
      <ul class="ml-auto flex items-center h-full">
        <li><a href="/">γ Home</a></li>
      </ul>
    </nav>
    <div class="max-w-[800px] w-full">
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
  @apply text-prime-300;
}

.my-bg-styles {
  @apply text-prime-200 bg-slate-900;
  font-family: 'Afacad', sans-serif;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  height: 100%;
  min-width: 100vw;
  min-height: 100vh;
}
</style>
