<template>
  <div class="flex flex-wrap px-2 overflow-hidden w-full justify-center">
    <div ref="editorRef" class="grow shrink-0 basis-[400px]"></div>
    <GStage class="grow w-full max-w-md aspect-square">
      <template #default>
        <SmoothScrollCharts :estimatorConst="Estimator" />
      </template>
    </GStage>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watchEffect } from 'vue';
import GStage from '../../vueRenderer/GStage.vue';
import SmoothScrollCharts from './SmoothScrollCharts.vue';
import * as Monaco from 'monaco-editor';
import './MonacoEditor';

const editorRef = ref<HTMLElement>();
const code = ref(`
    export default class Estimator{
      constructor(){
        this.speed = 0;
        this.lastPos = 0;
      }

      onPositionChange(pos, deltaT){
        this.speed = (pos - this.lastPos)*25 / deltaT;
        this.lastPos=pos;
      }

      getSpeed(){
        return this.speed
      }
    }
    `);
const Estimator = ref<any>();

let editor: Monaco.editor.IStandaloneCodeEditor;
onMounted(() => {
  editor = Monaco.editor.create(editorRef.value!, {
    language: 'javascript',
    value: code.value,
  });
  editor.onDidChangeModelContent((event) => {
    code.value = editor.getValue();
  });
});

watchEffect(async () => {
  const blob = new Blob([code.value], {
    type: 'application/javascript',
  });

  // Create a URL for the Blob object
  const url = URL.createObjectURL(blob);

  // Dynamically import the module using the URL
  try {
    /* @vite-ignore */
    Estimator.value = (await import(url)).default;
  } catch (error) {}
});

onUnmounted(() => editor.dispose());
</script>
