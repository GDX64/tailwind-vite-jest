<template>
  <input type="text" @input="$emit('change-ticker', ($event.target as any).value)" />
  <input type="text" @input="$emit('change-coin', ($event.target as any).value)" />
  <div v-for="ticker of data">
    <div class="flex">
      <div class="">{{ ticker.name }}:</div>
      <div
        class="font-bold"
        :class="Number(ticker.price) > 0 ? 'text-green-400' : 'text-red-400'"
      >
        {{ ticker.price }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TickerData } from './interfaces';
defineProps<{
  data: TickerData[];
}>();

defineEmits<{
  (event: 'change-ticker', value: string): void;
  (event: 'change-coin', value: string): void;
}>();
</script>
