<script setup lang="ts">
import { onMounted, shallowRef } from 'vue';
import BackGround from '../BackGround.vue';
import audioURL from './sample.mp3';

const ctx = new AudioContext();
const gainNode = ctx.createGain();
gainNode.connect(ctx.destination);
onMounted(async () => {
  gainNode.gain.value = 1;
});

async function play() {
  const audio = new Audio(audioURL);
  const track = ctx.createMediaElementSource(audio);
  track.connect(gainNode);
  ctx.resume();
  await audio.play();
  await new Promise((resolve) => {
    audio.onended = resolve;
  });
  track.disconnect();
  console.log('playing');
  // track.disconnect();
}
</script>

<template>
  <BackGround>
    <button class="bg-prime-800 rounded-md px-2 py-1" @click="play">Play</button>
  </BackGround>
</template>
