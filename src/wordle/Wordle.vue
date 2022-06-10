<template>
  <BackGround>
    <input type="text" v-model="input" maxlength="5" class="my-input" />
    <button @click="setAnswer(input)">Set answer</button>
    <suspense>
      <Solver :ans="answer" :key="answer" class="mt-8"></Solver>
    </suspense>
  </BackGround>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import BackGround from '../pages/BackGround.vue';
import Solver from './Solver.vue';
const answer = ref('hello');
const input = ref('');

function setAnswer(word: string) {
  if (word.length === 5) {
    answer.value = word;
  }
}
</script>
