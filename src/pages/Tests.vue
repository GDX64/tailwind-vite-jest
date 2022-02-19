<template>
  <BackGroundVue>
    <HistogramVue :list="list"></HistogramVue>
    <button @click="restart">Restart</button>
  </BackGroundVue>
</template>

<script lang="ts" setup>
import BackGroundVue from './BackGround.vue';
import HistogramVue from '../components/Histogram.vue';
import { ref } from 'vue';
import { createLiveHist } from '../domain/histogramGen';
import { Subscription } from 'rxjs';
const list = ref([1, 2, 3]);
let subscription = null as null | Subscription;
function restart() {
  subscription?.unsubscribe();
  subscription = createLiveHist(1, 10).subscribe((hist) => {
    list.value = hist;
  });
}

// (window as any).setList = (newList: number[]) => (list.value = newList);
</script>

<style></style>
