<template>
  <input type="text" v-model="planet" />
  <div class="results">
    <div v-for="moon of moons" data-test="moon">{{ moon.name }}: {{ moon.distance }}</div>
  </div>
  {{ planet }}
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { makeCBRequester } from './callbackRequester';
const planet = ref('');
const moons = ref([] as { name: string; distance: number }[]);
const requester = makeCBRequester(moons);
watch(planet, (value) => requester.setPlanet(value));
</script>
