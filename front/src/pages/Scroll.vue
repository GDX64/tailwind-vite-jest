<template>
  <input type="number" v-model="lines" class="w-20" />
  <div class="scrollzin" ref="container">
    <div class="fake-scroll" :style="style"></div>
    <div class="fake-content">{{ text }}</div>
  </div>
</template>

<script setup lang="ts">
import { faker } from '@faker-js/faker';
import { computed, reactive, ref, watchEffect } from 'vue';
const lines = ref(10);
const text = computed(() => faker.lorem.lines(lines.value));
const scroll = reactive({ top: 0 });
const container = ref<HTMLElement>();
const style = computed(() => ({
  top: scroll.top + 'px',
  right: '0px',
  height: barHeight.value + 'px',
}));
const barHeight = ref(20);
watchEffect((clear) => {
  if (container.value) {
    const item = container.value;
    const fn = () => {
      const maxScroll = item.scrollHeight - item.clientHeight;
      const percent = maxScroll ? item.scrollTop / maxScroll : 0;
      scroll.top = item.scrollTop + percent * (item.clientHeight - 30);
      barHeight.value = 10 + (50 * item.clientHeight) / item.scrollHeight;
    };
    item.addEventListener('scroll', fn);
    clear(() => item.removeEventListener('scroll', fn));
  }
});
</script>

<style>
.scrollzin {
  max-height: 500px;
  width: 500px;
  overflow-y: scroll;
  position: relative;
  background-color: yellow;
}
.scrollzin::-webkit-scrollbar {
  display: none;
}

.fake-content {
  width: 100%;
  background-color: pink;
}
.fake-scroll {
  width: 10px;
  position: absolute;
  background-color: red;
}
</style>
