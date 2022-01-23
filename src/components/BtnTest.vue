<script setup lang="ts">import { ref } from 'vue';

const props = defineProps<{ list: string[] }>();

const inputValue = ref('')
const currentList = ref(props.list)

function insertData() {
  if (inputValue.value === '') return
  currentList.value.push(inputValue.value)
  inputValue.value = ''
}

function remove(removeIndex: number) {
  currentList.value = currentList.value.filter((_value, index) => index != removeIndex)
}

</script>

<template>
  <div class="flex-col flex">
    <ul ref="list">
      <li
        v-for="(element, index) in currentList"
        class="w-72 flex justify-between hover:bg-neutral-400/25 pr-2 pl-2 rounded-sm"
      >
        <span test-data="todo">{{ element }}</span>
        <div
          test-data="remove-btn"
          @click="remove(index)"
          class="text-red-400 hover:text-red-700 cursor-pointer"
        >x</div>
      </li>
    </ul>
    <input v-model="inputValue" type="text" ref="input" class="w-52 rounded-sm mb-5" />
    <button
      @click="insertData"
      ref="add-btn"
      class="bg-gray-800 rounded-md w-28 hover:bg-zinc-500"
    >Add</button>
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
