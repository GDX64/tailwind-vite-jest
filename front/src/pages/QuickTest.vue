<template>
  <MySelect :selected-value="1">
    <template #header="{ data }">
      <div class="w-64">this is {{ data }}</div>
    </template>
    <MyOption :value="1" data="first">one</MyOption>
    <div>nao é uma opção</div>
    <MyOption :value="2" data="second">two</MyOption>
    <MyOption :value="3" data="third">three</MyOption>
  </MySelect>
</template>

<script lang="ts" setup>
import MySelect from '../menu/MySelect.vue';
import MyOption from '../menu/MyOption.vue';
</script>
