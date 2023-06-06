<template>
  <div class="flex flex-wrap px-4 overflow-y-scroll overflow-x-hidden h-full w-full">
    <div class="grow shrink-0 basis-[300px] overflow-hidden">
      <div ref="editorRef" class="w-full"></div>
      <button
        class="bg-green-300 rounded-md h-6 px-2 active:bg-green-200 my-2"
        @click="runCode"
      >
        Run
      </button>
      <button
        class="bg-neutral-300 rounded-md h-6 px-2 active:bg-neutral-200 my-2 mx-2"
        @click="resetCode"
      >
        Reset
      </button>
    </div>
    <GStage class="grow w-full max-w-2xl aspect-square">
      <template #default>
        <SmoothScrollCharts :estimatorConst="Estimator" />
      </template>
    </GStage>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue';
import GStage from '../../vueRenderer/GStage.vue';
import SmoothScrollCharts from './SmoothScrollCharts.vue';
import { basicSetup, EditorView } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { storageRef } from '../../utils/rxjsUtils';

const editorRef = ref<HTMLElement>();

const errorMsg = ref('');
const originalCode = `
export default class Estimator{
  constructor(){
    this.speed = 0;
    this.lastPos = 0;
  }
  
  //Do not remove this method
  onPositionChange(pos, deltaT){
    this.speed = (pos - this.lastPos) / deltaT;
    this.lastPos=pos;
  }
  
  //Do not remove this method
  getDamping(){
    return 0.99
  }
  
  //Do not remove this method
  getSpeed(){
    return this.speed
  }
}
`;
const code = storageRef('dspCode', originalCode);
const Estimator = ref<any>();

const editor = computed(() => {
  if (editorRef.value) {
    return new EditorView({
      extensions: [basicSetup, javascript()],
      parent: editorRef.value,
      doc: code.value,
    });
  }
  return null;
});

function runCode() {
  code.value = editor.value?.state.doc.toString() ?? code.value;
}

function resetCode() {
  code.value = originalCode;
  if (editor.value) {
    const transaction = editor.value.state.update({
      changes: {
        from: 0,
        to: editor.value.state.doc.length,
        insert: originalCode,
      },
    });
    editor.value.dispatch(transaction);
  }
}

watch(editor, (editor, __, clear) => {
  clear(() => editor?.destroy());
});

watchEffect(async () => {
  const blob = new Blob([code.value], {
    type: 'application/javascript',
  });

  // Create a URL for the Blob object
  const url = URL.createObjectURL(blob);

  // Dynamically import the module using the URL
  try {
    Estimator.value = (await import(/* @vite-ignore */ url)).default;
    errorMsg.value = '';
  } catch (error) {
    errorMsg.value = (error as Error).message;
  }
});
</script>
