<template>
  <input type="text" v-model="planet" />
  <div class="results" v-if="!errorMsg">
    <div v-for="moon of moons" data-test="moon">{{ moon.name }}: {{ moon.distance }}</div>
  </div>
  <div v-else>{{ errorMsg }}</div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { makePromiseRequester } from './callbackRequester';
const planet = ref('');
const moons = ref([] as { name: string; distance: number }[]);
const errorMsg = ref('');
const requester = makePromiseRequester(moons, errorMsg);
watch(planet, (value) => requester.setPlanet(value));
</script>
