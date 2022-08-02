<template>
  <input type="text" v-model="value" class="bg-slate-400" />
</template>

<script lang="ts" setup>
import { computed, getCurrentInstance, ref } from 'vue';
const _value = ref('hello');
const value = computed({
  get: () => _value.value,
  set(another) {
    const old = _value.value;
    _value.value = another;
    _value.value = old;
  },
});
</script>
