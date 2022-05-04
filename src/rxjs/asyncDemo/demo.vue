<template>
  <input type="text" v-model="planet" />
  <div class="results" v-if="!errorMsg">
    <div v-for="moon of moons" data-test="moon">{{ moon.name }}: {{ moon.distance }}</div>
  </div>
  <div v-else>{{ errorMsg }}</div>
</template>

<script lang="ts" setup>
import { onUnmounted, ref, watch } from 'vue';
import {
  makeCBRequester,
  makeObservableRequester,
  makePromiseRequester,
} from './callbackRequester';
const planet = ref('');
const moons = ref([] as { name: string; distance: number }[]);
const errorMsg = ref('');
const requester = makeCBRequester(moons, errorMsg);
watch(planet, (value) => requester.setPlanet(value));
onUnmounted(() => {
  requester.unsubscribe();
});
</script>
