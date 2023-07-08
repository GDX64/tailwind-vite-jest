<template>
  <button
    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    @click="run"
  >
    Run
  </button>
  <button
    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    @click="run_rust"
  >
    Run Rust
  </button>
  <div class="block">
    {{ time }}
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { toBase64 } from '../benchmarks/toBase64';
import init, { Base64Decoder } from 'rust/pkg';

const buffer = new Uint8Array(
  [...Array(2 ** 24)].map(() => Math.floor(Math.random() * 0xff))
);

const time = ref(0);

function run() {
  performance.mark('rust-start');
  toBase64(buffer);
  const measure = performance.measure('rust', 'rust-start');
  time.value = measure.duration;
}

const decoder = new TextDecoder();
let base64Decorder: Base64Decoder | null = null;
init();
async function run_rust() {
  if (!base64Decorder) {
    base64Decorder = Base64Decoder.new();
  }
  performance.mark('rust-start');
  const result = base64Decorder.to_base64(buffer);
  const measure = performance.measure('rust', 'rust-start');
  time.value = measure.duration;
}
</script>
