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
import { createLiveHist, Bucket } from '../domain/histogramGen';
import { Subscription } from 'rxjs';
const list = ref([] as Bucket[]);
let subscription = null as null | Subscription;
function restart() {
  subscription?.unsubscribe();
  subscription = createLiveHist(3, 10).subscribe((hist) => {
    list.value = hist;
  });
}

// (window as any).setList = (newList: number[]) => (list.value = newList);
</script>

<style></style>
