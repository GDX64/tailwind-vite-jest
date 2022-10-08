<template>
  <div class="">
    <header class="flex justify-between w-full mb-1">
      <FieldEditTip :value="main" @update:value="$emit('update:main', $event)">
        <div class="hover:bg-sky-400">{{ main }}</div>
      </FieldEditTip>
      <div class="">{{ dateAndPlace }}</div>
    </header>
    <div v-if="description" class="text-gray-700">
      <div class="rounded-full w-[6px] h-[6px] bg-gray-700 mr-2 inline-block"></div>
      <LinkProcess class="text-with-link" :text="description"></LinkProcess>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import LinkProcess from './LinkProcess';
import FieldEditTip from './FieldEditTip.vue';

defineEmits<{ (event: 'update:main', value: string): void }>();
const props = defineProps<{
  main: string;
  dateAndPlace?: string;
  title?: string;
  description?: string;
}>();
const mainEdit = ref(props.main);
</script>
