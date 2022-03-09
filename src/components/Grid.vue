<template>
  <div class="container">
    <div class="square"></div>
    <div class="square"></div>
    <div class="square"></div>
    <div class="square"></div>
    <div class="square"></div>
    <div class="square"></div>
  </div>
</template>

<script lang="ts" setup></script>

<style>
.square {
  @apply w-[40px] h-[40px] bg-red-500;
}
.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, min(40px));
  grid-auto-columns: 100px;
  width: 150px;
  gap: 10px;
  height: 50px;
  overflow: hidden;
}
</style>
