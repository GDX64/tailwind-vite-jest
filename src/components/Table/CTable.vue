<template>
  <table class>
    <tr>
      <th v-for="col in colConfig">
        <slot name="header" :col="col">
          <div class="w-10">{{ col.header }}</div>
        </slot>
      </th>
    </tr>
    <slot v-for="(row, index) in rows" name="row" :cols="colConfig" :row="row">
      <CRow :row="row" :col-config="colConfig"></CRow>
    </slot>
  </table>
</template>

<script lang="ts" setup>
import { ColConfig } from './CRow.vue';
import CRow from './CRow.vue';
defineProps<{ rows: Readonly<any[]>; colConfig: ColConfig[] }>();
</script>
