<template>
  <div class="flex justify-between">
    <FieldEditorVue
      v-if="false"
      v-model:field="cvData.categories[editedCategory].fields[editedField]"
    ></FieldEditorVue>
    <CVSimpleVue :cv-data="cvData" @update-field="onEditField"></CVSimpleVue>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import CVSimpleVue from '../components/CV/CVSimple.vue';
import FieldEditorVue from '../components/CV/FieldEditor.vue';
import glmachadoCVData from '../components/CV/glmachadoCVData';
const cvData = reactive(glmachadoCVData);
const editedCategory = ref(0);
const editedField = ref(0);
function onEditField({ categoryIndex = 0, fieldIndex = 0 }) {
  editedCategory.value = categoryIndex;
  editedField.value = fieldIndex;
}
</script>
