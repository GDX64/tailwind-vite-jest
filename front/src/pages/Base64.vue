<template>
  <button
    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    @click="run"
  >
    Run
  </button>
</template>

<script setup lang="ts">
import { toBase64 } from '../benchmarks/toBase64';
const buffer = new Uint8Array(
  [...Array(2 ** 24)].map(() => Math.floor(Math.random() * 0xff))
);

function run() {
  toBase64(buffer);
}
</script>
