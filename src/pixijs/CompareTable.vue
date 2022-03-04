<template>
  <table class="text-sm">
    <tr v-for="row of table">
      <td v-for="col of config">{{ row[col.prop] }}</td>
    </tr>
  </table>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { createRandomRows, createConfigs } from './pixiTable';

const table = ref(createRandomRows());
const config = createConfigs();
setInterval(() => (table.value = createRandomRows()), 20);
</script>
