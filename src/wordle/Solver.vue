<template>
  <BackGround>
    <ul>
      <li v-for="guess of inputHistory">{{ guess }}</li>
    </ul>
    <input type="text" v-model="input" maxlength="5" @keydown.enter="onEnter" />
  </BackGround>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import init, { Wordle } from 'wasm';
import BackGround from '../pages/BackGround.vue';

const {} = await init();
const player = Wordle.new();
player.set_ans('hello');
const inputHistory = ref([] as string[]);
const input = ref('');

function onEnter() {
  inputHistory.value = [...inputHistory.value, input.value];
  console.log(player.play(input.value));
  console.log(player.calc_best_guesses());
}
</script>
