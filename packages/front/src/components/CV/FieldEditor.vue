<template>
  <div>
    <input type="text" v-model="localData.title" @input="onInput" />
    <input type="text" v-model="localData.schoolPlaceDate" @input="onInput" />
    <textarea v-model="localData.description" @input="onInput" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';
import { Field } from './SimpleCVTypes';

const props = defineProps<{ field: Field }>();
const emit = defineEmits<{
  (event: 'update:field', field: Field): void;
}>();
const localData = ref({ ...props.field });
watchEffect(() => {
  localData.value = { ...props.field };
});
function onInput() {
  emit('update:field', { ...localData.value });
}
</script>
