<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { inject, watch, onMounted, reactive, onUnmounted, computed } from 'vue';
import { ChartNode, RectNode, ChartType } from './CartesianCharts';

const props = defineProps<{
  width: number;
  height: number;
  x?: number;
  y?: number;
  color?: string;
}>();

const parentNode = inject('parentNode') as ChartNode;

function currentNode(): RectNode {
  return {
    data: {
      x: props.x ?? 0,
      y: props.y ?? 0,
      color: props.color ?? 'black',
      width: props.width,
      height: props.height,
    },
    type: ChartType.RECT,
  };
}

const node = computed(() => reactive(currentNode()));

watch(
  node,
  (current, _old, clear) => {
    parentNode.children?.push(current);
    clear(() => {
      parentNode.children = parentNode.children?.filter((item) => item !== current);
    });
  },
  { immediate: true }
);
</script>
