<template>
  <BackGround>
    <ul>
      <li v-for="guess of inputHistory">{{ guess }}</li>
    </ul>
    <input
      type="text"
      class="text-black bg-slate-300 rounded-md pl-1"
      v-model="input"
      maxlength="5"
      @keydown.enter="onEnter"
    />
    <h2>Best guesses</h2>
    <ul>
      <li
        v-for="guess of bestGuesses"
        class="w-40 relative pl-1"
        @click="onWordClick(guess.word)"
      >
        {{ guess.word }} {{ guess.entropy.toFixed(2) }} bits
        <div
          class="bg-slate-600/20 h-full absolute top-0 left-0 rounded-sm"
          :style="{ width: `${guess.percent * 100}%` }"
        ></div>
      </li>
    </ul>
    <h3>Distribution</h3>
    <div class="flex h-[200px] items-end">
      <div
        v-for="value of distribution"
        class="w-1 bg-slate-500"
        :style="{ height: `${value * 100}%` }"
      ></div>
    </div>
  </BackGround>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import init, { Wordle } from 'wasm';
import BackGround from '../pages/BackGround.vue';

const {} = await init();
const player = Wordle.new();
player.set_ans('hello');
const inputHistory = ref([] as string[]);
const input = ref('');
const bestGuesses = ref(getBestGuesses());
const distribution = computed(() => {
  if (isvalidWord(input.value)) {
    return normalize([...player.distribution_of(input.value)]);
  }
  return [];
});

function onEnter() {
  inputHistory.value = [...inputHistory.value, input.value];
  console.log(player.play(input.value));
  bestGuesses.value = getBestGuesses();
  console.log();
}

function getBestGuesses() {
  const guesses: [string, number][] = player.calc_best_guesses();
  const biggestEntropy = Math.max(...guesses.map(([, num]) => num));
  return guesses.map(([word, entropy]) => {
    return { word, entropy, percent: entropy / biggestEntropy };
  });
}

function getDistributionOf(word: string) {}

function normalize(arr: number[]) {
  const max = Math.max(...arr);
  return arr.map((value) => value / max);
}

function onWordClick(word: string) {
  input.value = word;
}
function isvalidWord(word: string) {
  return word.length === 5;
}
</script>
