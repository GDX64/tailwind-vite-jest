<template>
  <div class="flex">
    <div class="pr-10">
      <!-- INPUT CONTAINER -->
      <div class="flex">
        <input
          type="text"
          class="text-black bg-slate-300 rounded-md pl-1 mr-2"
          v-model="input"
          maxlength="5"
          @keydown.enter="onEnter"
        />
        <div>{{ inputEntropy }}</div>
      </div>
      <ul>
        <li v-for="guess of inputHistory">
          {{ guess.word }} {{ guess.expected }} {{ guess.information }}
        </li>
      </ul>
    </div>
    <div>
      <!-- GUESSES CONTAINER -->
      <h2>Best guesses</h2>
      <ul>
        <li
          v-for="guess of bestGuesses"
          class="w-40 relative pl-"
          @click="onWordClick(guess.word)"
        >
          {{ guess.word }} {{ guess.entropy.toFixed(2) }} bits
          <div
            class="bg-slate-600/20 h-full absolute top-0 left-0 rounded-sm hover:bg-slate-400/20"
            :style="{ width: `${guess.percent * 100}%` }"
          ></div>
        </li>
      </ul>
    </div>
  </div>
  <h3>Distribution</h3>
  <div class="flex h-[200px] items-end">
    <div
      v-for="{ value, index } of distribution"
      @click="onDistributionClick(index)"
      class="bg-slate-500 hover:bg-slate-400"
      :style="{ height: `${value * 100}%`, width: '5px', 'margin-right': '1px' }"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import init, { Wordle } from 'wasm';

const {} = await init();
const player = Wordle.new();
player.set_ans('hello');
const inputHistory = ref([] as { word: string; information: string; expected: string }[]);
const input = ref('');
const inputEntropy = computed(() =>
  isvalidWord(input.value) ? player.entropy_of(input.value).toFixed(2) : '0'
);
const bestGuesses = ref(getBestGuesses());
const distribution = computed(() => {
  if (isvalidWord(input.value)) {
    return getDistribution(input.value);
  }
  return [];
});

function onEnter() {
  const [, information] = player.play(input.value);
  inputHistory.value = [
    ...inputHistory.value,
    {
      word: input.value,
      information: information.toFixed(2),
      expected: inputEntropy.value,
    },
  ];
  bestGuesses.value = getBestGuesses();
}

function getBestGuesses() {
  const guesses: [string, number][] = player.calc_best_guesses();
  const biggestEntropy = Math.max(...guesses.map(([, num]) => num));
  return guesses.map(([word, entropy]) => {
    return { word, entropy, percent: entropy / biggestEntropy };
  });
}

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

function maskFromNumber(num: number) {
  return num.toString(3).padEnd(5, '0').split('').map(Number);
}

function getDistribution(word: string) {
  return normalize([...player.distribution_of(word)])
    .map((num, index) => {
      return { value: num, index };
    })
    .sort((a, b) => b.value - a.value);
}

function onDistributionClick(value: number) {
  console.log(maskFromNumber(value));
}
</script>
