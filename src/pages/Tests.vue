<template>
  <BackGroundVue>
    <HistogramVue :list="list" :max-count="maxCount"></HistogramVue>
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
const maxCount = ref(0);
let subscription = null as null | Subscription;
function restart() {
  subscription?.unsubscribe();
  subscription = createLiveHist(3).subscribe((histInfo) => {
    list.value = histInfo.histList;
    maxCount.value = histInfo.maxCount;
  });
}

// (window as any).setList = (newList: number[]) => (list.value = newList);
</script>

<style></style>
