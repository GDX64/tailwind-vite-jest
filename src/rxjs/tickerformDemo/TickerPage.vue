<template>
  <h1>Requester</h1>
  <TickerVue :data="data"></TickerVue>
</template>

<script lang="ts" setup>
import FakeRequester from './FakeRequester';
import TickerVue from './ticker.vue';
import TickerRequestController from './TickerRequestController';

const fakerequester = new FakeRequester();
const tickerRequester = new TickerRequestController(fakerequester);
const data = tickerRequester.getReference();
</script>
