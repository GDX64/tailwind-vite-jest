<template>
  <input
    class="my-input"
    test-data="ticker-input"
    type="text"
    :value="ticker"
    @input="$emit('update:ticker', ($event.target as any).value)"
  />
  <select
    class="my-input"
    test-data="coin-input"
    :value="coin"
    @input="$emit('update:coin', ($event.target as any).value)"
  >
    <option value="BRL">BRL</option>
    <option value="USD">USD</option>
    <option value="ARS">ARS</option>
  </select>
  <div v-for="ticker of data">
    <div class="flex">
      <div class="">{{ ticker.name }}:</div>
      <div
        class="font-bold"
        :class="ticker.price >= 0 ? 'text-green-400' : 'text-red-400'"
      >
        {{ ticker.price ? ticker.price.toFixed(2) : '-' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TickerData } from './interfaces';
defineProps<{
  data: TickerData[];
  coin: string;
  ticker: string;
}>();

defineEmits<{
  (event: 'update:ticker', value: string): void;
  (event: 'update:coin', value: string): void;
}>();
</script>
