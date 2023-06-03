<template>
  <div class="flex flex-wrap px-2 overflow-hidden w-full">
    <GStage class="grow w-full max-w-md aspect-square">
      <template #default>
        <SmoothScrollCharts />
      </template>
    </GStage>
    <div ref="editorRef" class="grow shrink-0 basis-[400px]"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue';
import GStage from '../../vueRenderer/GStage.vue';
import SmoothScrollCharts from './SmoothScrollCharts.vue';
import * as Monaco from 'monaco-editor';
import './MonacoEditor';

const editorRef = ref<HTMLElement>();
const code = ref('');

watchEffect(() => {
  console.log(eval(code.value));
});
let editor: Monaco.editor.IStandaloneCodeEditor;
onMounted(() => {
  editor = Monaco.editor.create(editorRef.value!, {
    language: 'typescript',
    value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
  });
  editor.onDidChangeModelContent((event) => {
    code.value = editor.getValue();
  });
});

onUnmounted(() => editor.dispose());
</script>
