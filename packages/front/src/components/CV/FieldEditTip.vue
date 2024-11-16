<template>
  <TippyWrap @show="edit = value" :trigger="'click'">
    <template #default>
      <slot></slot>
    </template>
    <template #content>
      <div class="pop-container w-96 p-3">
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

<style></style>
