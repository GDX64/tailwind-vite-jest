<template>
  <div class="">
    <h1>Requester</h1>
    <TickerVue :data="data" v-model:ticker="ticker" v-model:coin="coin"></TickerVue>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';
import FakeRequester from './FakeRequester';
import TickerVue from './Ticker.vue';
import TickerRequestController from './TickerRequestController';

const fakerequester = new FakeRequester();
const tickerRequester = new TickerRequestController(fakerequester);
const data = tickerRequester.getReference();
const coin = ref('USD');
const ticker = ref('');
watchEffect(() => tickerRequester.coin(coin.value));
watchEffect(() => tickerRequester.ticker(ticker.value));
</script>
