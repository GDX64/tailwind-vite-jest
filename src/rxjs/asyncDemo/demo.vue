<template>
  <input type="text" v-model="planet" />
  <div class="results">
    <template v-for="moon of moons">
      <label :for="moon">{{ moon }}</label>
      <input type="radio" :id="moon" :value="moon" v-model="selectedMoon" />
    </template>
  </div>
  {{ planet }}
</template>

<script lang="ts" setup>
import { Ref, ref, watchEffect } from 'vue';
import { makeCBRequester } from './callbackRequester';
const planet = ref('');
const moons = ref([] as string[]);
const selectedMoon = ref('');
const distance = ref('');
const requester = makeCBRequester(moons, distance);
// watchEffect(() => requester.setMoon(selectedMoon.value));
watchEffect(() => requester.setPlanet(planet.value));
</script>
