<template></template>

<script lang="ts" setup>
import { markRaw, isReactive, reactive } from 'vue';
class Hello {
  constructor() {
    markRaw(this);
  }
}
const noReactve = new Hello();
markRaw(noReactve);
const arr = reactive([] as any[]);
arr.push(noReactve);
console.log(arr);
</script>
