<template>
  <div class="" :class="cursor === value ? 'bg-slate-500' : ''" @click="onClick">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { inject, onMounted, onUnmounted, ref } from 'vue';
import { cursorKey, registerKey, selectedKey } from './SelectThings';

const props = defineProps<{ value: number; data?: any }>();

const event = inject(registerKey, () => {});
const cursor = inject(cursorKey, ref(-1));
const select = inject(selectedKey, () => {});
onMounted(() => {
  event(props.value, props.data);
});

function onClick() {
  select(props.value);
}
</script>
