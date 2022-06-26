<template>
  <div class="">
    <h1>Requester</h1>
    <TickerVue :data="tickerData" v-model:ticker="ticker" v-model:coin="coin"></TickerVue>
  </div>
</template>

<script lang="ts" setup>
import { Subject } from 'rxjs';
import { onMounted, ref, watchEffect } from 'vue';
import FakeRequester from './FakeRequester';
import { TickerData } from './interfaces';
import RequesterToObs from './RequesterToObs';
import TickerVue from './Ticker.vue';
import TickerRequestController from './TickerRequestController';

const fakerequester = new FakeRequester();
const tickerRequester = new TickerRequestController(new RequesterToObs(fakerequester));
const ticker$ = new Subject<string>();
const coin$ = new Subject<string>();
const tickerData = ref([] as TickerData[]);
const coin = ref('USD');
const ticker = ref('');
const stopTicker = watchEffect(() => ticker$.next(ticker.value));
const stopCoin = watchEffect(() => coin$.next(coin.value));
const subscription = tickerRequester.data$(ticker$, coin$).subscribe((data) => {
  tickerData.value = data;
});
onMounted(() => {
  stopTicker();
  stopCoin();
  subscription.unsubscribe();
});
</script>
