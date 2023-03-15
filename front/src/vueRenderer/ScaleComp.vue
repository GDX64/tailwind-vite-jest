<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { inject, watch, reactive, provide } from 'vue';
import { ChartNode, ChartType, ScaleNode } from './CartesianCharts';

const props = defineProps<{
  x: { domain: [number, number]; image: [number, number] };
  y: { domain: [number, number]; image: [number, number] };
}>();

const parentNode = inject('parentNode') as ChartNode;

const node = reactive(currentNode());

provide('parentNode', node);

function currentNode(): ScaleNode {
  return {
    data: {
      x: props.x,
      y: props.y,
    },
    children: [],
    type: ChartType.SCALE,
  };
}

defineExpose({ node });

watch(
  () => currentNode(),
  (current, _old, clear) => {
    Object.assign(node, current);
    parentNode.children?.push(node);
    clear(() => {
      parentNode.children = parentNode.children?.filter((item) => item !== node);
    });
  },
  { immediate: true }
);
</script>
