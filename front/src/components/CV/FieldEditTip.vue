<template>
  <TippyWrap @show="edit = value">
    <template #default>
      <slot></slot>
    </template>
    <template #content>
      <div class="bg-sky-800/80 w-96 p-3 rounded-sm">
        <textarea
          class="bg-sky-800 w-full text-white rounded-md outline-none"
          v-model="edit"
        />
        <button @click="$emit('update:value', edit)" class="action-btn mr-2">Ok</button>
        <button class="action-btn" :class="edit === value ? 'brightness-50' : ''">
          Cancel
        </button>
      </div>
    </template>
  </TippyWrap>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import TippyWrap from '../../TippyWrapper/TippyWrap.vue';

const props = defineProps<{ value: string }>();
defineEmits<{ (event: 'update:value', value: string): void }>();

const edit = ref(props.value);
</script>

<style>
.action-btn {
  @apply w-16 h-7 bg-sky-500 text-white rounded-sm pr-2 pl-2 hover:bg-sky-400;
}
</style>
