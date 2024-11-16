<template>
  <div>
    <div class="">
      <span>{{ textValue }}</span>
      <input type="text" class="" v-model="textValue" />
    </div>
    <label for="">Provided: </label>
    <span>{{ message }}</span>
  </div>
</template>

<script lang="ts" setup>
import { onUnmounted, ref, watch } from 'vue';
import { useTestStore } from '../stores/testStore';
const textValue = ref('');
const emit = defineEmits<{ (event: 'update:textValue', value: string): void }>();
watch(textValue, () => emit('update:textValue', textValue.value));
onUnmounted(() => {
  console.log('desmontei');
});

const message = useTestStore().message;
useTestStore().update('hi');
</script>
