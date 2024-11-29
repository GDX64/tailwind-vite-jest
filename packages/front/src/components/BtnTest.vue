<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{ list: string[] }>();

const inputValue = ref('');
const currentList = ref(props.list);

function insertData() {
  if (inputValue.value === '') return;
  currentList.value.push(inputValue.value);
  inputValue.value = '';
}

function remove(removeIndex: number) {
  currentList.value = currentList.value.filter((_value, index) => index != removeIndex);
}
</script>

<template>
  <div class="flex-col flex select-none">
    <ul ref="list" class="mb-5">
      <li
        v-for="(element, index) in currentList"
        class="w-72 flex justify-between items-center hover:bg-neutral-400/25 hover:scale-105 h-8 pr-2 pl-2 rounded-sm transition-all duration-200"
      >
        <span>{{ element }}</span>
        <div
          @click="remove(index)"
          class="text-red-400 hover:text-red-700 cursor-pointer"
        >
          x
        </div>
      </li>
    </ul>
    <input
      v-model="inputValue"
      @keypress.enter="insertData"
      type="text"
      ref="input"
      class="w-52 rounded-sm mb-5 text-prime-900 bg-prime-400 outline outline-2 border-none"
    />
    <button
      @click="insertData"
      ref="add-btn"
      class="bg-gray-800 rounded-md w-28 hover:bg-zinc-500"
    >
      Add
    </button>
  </div>
</template>

<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
