<template>
  <div>
    <span>{{ textValue }}</span>
    <input type="text" class="" v-model="textValue" />
  </div>
</template>

<script lang="ts" setup>
import { onUnmounted, ref, watch } from 'vue';
const textValue = ref('');
const emit = defineEmits<{ (event: 'update:textValue', value: string): void }>();
watch(textValue, () => emit('update:textValue', textValue.value));
onUnmounted(() => {
  console.log('desmontei');
});
</script>
