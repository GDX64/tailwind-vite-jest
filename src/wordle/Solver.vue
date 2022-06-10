<template>
  <div>
    <div class="flex">
      <div class="pr-10">
        <!-- INPUT CONTAINER -->
        <div>
          <div>
            total information:
            <span class="text-green-200">{{ totalInformation.toFixed(2) }}</span>
          </div>
          <div>
            you still need:
            <span class="text-blue-300">{{ neededInformation.toFixed(2) }}</span>
          </div>
        </div>
        <div class="flex items-center">
          <input
            type="text"
            class="my-input mr-2 mt-2 mb-2"
            v-model="input"
            maxlength="5"
            @keydown.enter="onEnter"
          />
          <div class="text-yellow-200">{{ inputEntropy }}</div>
        </div>
        <ul>
          <li v-for="guess of inputHistory">
            <WordleMask :mask="guess.mask" :word="guess.word"></WordleMask>
            expected: <span class="text-yellow-200">{{ guess.expected }}</span> got:
            <span class="text-green-200">{{ guess.information }}</span>
          </li>
        </ul>
      </div>
      <div>
        <!-- GUESSES CONTAINER -->
        <div class="flex items-center">
          <h2 class="pr-3">Best guesses</h2>
          <Refresh
            class="w-5 h-5 fill-slate-600 hover:fill-slate-400"
            @click="onRefresh"
          ></Refresh>
        </div>
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
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import init, { Wordle } from 'wasm';
import Refresh from '../assets/arrows-rotate-solid.svg?component';
import WordleMask from './WordleMask.vue';

const props = defineProps<{ ans: string }>();
const {} = await init();

const player = Wordle.new();
player.set_ans(props.ans);

const inputHistory = ref(
  [] as { word: string; information: string; expected: string; mask: number[] }[]
);

const totalInformation = computed(() => {
  return inputHistory.value.reduce(
    (acc, { information }) => acc + Number(information),
    0
  );
});

const neededInformation = computed(() => -totalInformation.value - Math.log2(1 / 13_000));
const input = ref('');
const inputEntropy = computed(() =>
  isvalidWord(input.value) ? player.entropy_of(input.value).toFixed(2) : '0'
);

const bestGuesses = ref([] as ReturnType<typeof getBestGuesses>);
const distribution = computed(() => {
  if (isvalidWord(input.value)) {
    return getDistribution(input.value);
  }
  return [];
});

function onEnter() {
  const [mask, information] = player.play(input.value);
  inputHistory.value = [
    ...inputHistory.value,
    {
      word: input.value,
      information: information.toFixed(2),
      expected: inputEntropy.value,
      mask,
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
function onRefresh() {
  bestGuesses.value = getBestGuesses();
}
</script>
