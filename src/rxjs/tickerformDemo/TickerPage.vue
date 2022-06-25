<template>
  <div class="">
    <h1>Requester</h1>
    <TickerVue
      :data="data"
      @change-ticker="tickerRequester.ticker($event)"
      @change-coin="tickerRequester.coin($event)"
    ></TickerVue>
  </div>
</template>

<script lang="ts" setup>
import FakeRequester from './FakeRequester';
import TickerVue from './Ticker.vue';
import TickerRequestController from './TickerRequestController';

const fakerequester = new FakeRequester();
const tickerRequester = new TickerRequestController(fakerequester);
const data = tickerRequester.getReference();
</script>
