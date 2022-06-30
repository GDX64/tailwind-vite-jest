<template>
  <div class="">
    <h1>Requester</h1>
    <TickerVue :data="tickerData" v-model:ticker="ticker" v-model:coin="coin"></TickerVue>
  </div>
</template>

<script lang="ts" setup>
import { BehaviorSubject } from 'rxjs';
import { onUnmounted, Ref, ref, watchEffect } from 'vue';
import FakeRequester from './FakeRequester';
import { TickerData } from './interfaces';
import RequesterToObs from './RequesterToObs';
import TickerVue from './Ticker.vue';
import TickerRequestController from './TickerRequestController';
import { testQueues } from './aboutQueues';
testQueues();
const fakerequester = new FakeRequester();
const tickerRequester = new TickerRequestController(new RequesterToObs(fakerequester));
const coin = ref('USD');
const ticker = ref('');
const tickerData = useTickerData(ticker, coin);

function useTickerData(ticker: Ref<string>, coin: Ref<string>) {
  const ticker$ = new BehaviorSubject<string>(ticker.value);
  const coin$ = new BehaviorSubject<string>(coin.value);
  const stopTicker = watchEffect(() => ticker$.next(ticker.value));
  const stopCoin = watchEffect(() => coin$.next(coin.value));
  const tickerData = ref([] as TickerData[]);
  const subscription = tickerRequester.data$(ticker$, coin$).subscribe((data) => {
    tickerData.value = data;
  });
  onUnmounted(() => {
    stopTicker();
    stopCoin();
    subscription.unsubscribe();
  });
  return tickerData;
}
</script>
