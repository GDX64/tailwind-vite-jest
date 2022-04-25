<template>
  <div>
    {{ data }}
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUpdate, onMounted, onUpdated, ref, onRenderTriggered } from 'vue';
const data = ref('');
function fakeAPI() {
  return new Promise((resolve) => setTimeout(resolve));
}
onMounted(async () => {
  await fakeAPI();
  data.value = 'world';
  console.log('changed text');
});

onBeforeUpdate(() => {
  console.log('before update');
});

onRenderTriggered(() => {
  console.log('rerender');
});

onUpdated(() => {
  console.log('updated');
});
</script>
