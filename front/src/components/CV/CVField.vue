<template>
  <div class="">
    <header class="flex justify-between w-full mb-1">
      <TippyWrap>
        <template #default>
          <div class="hover:bg-sky-400">{{ main }}</div>
        </template>
        <template #content>
          <div class="bg-sky-800/80 w-96 p-3 rounded-sm">
            <textarea
              class="bg-sky-800 w-full text-white rounded-md outline-none"
              :value="main"
            />
            <button
              class="w-fit h-6 bg-sky-500 text-white rounded-sm pr-2 pl-2 hover:bg-sky-400"
            >
              Ok
            </button>
          </div>
        </template>
      </TippyWrap>
      <div class="">{{ dateAndPlace }}</div>
    </header>
    <div v-if="hasDescription" class="text-gray-700">
      <div class="rounded-full w-[6px] h-[6px] bg-gray-700 mr-2 inline-block"></div>
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import TippyWrap from '../../TippyWrapper/TippyWrap.vue';
withDefaults(
  defineProps<{
    main: string;
    dateAndPlace?: string;
    title?: string;
    hasDescription?: boolean;
  }>(),
  {
    hasDescription: true,
  }
);
</script>
