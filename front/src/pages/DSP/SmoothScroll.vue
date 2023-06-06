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
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import GStage from '../../vueRenderer/GStage.vue';
import SmoothScrollCharts from './SmoothScrollCharts.vue';
import { basicSetup, EditorView } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { useAnimation, useInterval as useInterval } from '../../utils/rxjsUtils';

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

useInterval(() => {
  code.value = editor.value?.state.doc.toString() ?? code.value;
}, 1000);

watch(editor, (editor, __, clear) => {
  clear(() => editor?.destroy());
});

watchEffect(async () => {
  const blob = new Blob([code.value], {
    type: 'application/javascript',
  });
  console.log('changed code');

  // Create a URL for the Blob object
  const url = URL.createObjectURL(blob);

  // Dynamically import the module using the URL
  try {
    /* @vite-ignore */
    Estimator.value = (await import(url)).default;
  } catch (error) {}
});
</script>
