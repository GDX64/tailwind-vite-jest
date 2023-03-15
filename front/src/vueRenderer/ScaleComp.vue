<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { range } from 'ramda';
import { inject, watch, reactive, provide, computed } from 'vue';
import { ChartNode, ChartType, ScaleNode } from './CartesianCharts';

const props = defineProps<{
  x: { domain: [number, number]; image: [number, number] };
  y: { domain: [number, number]; image: [number, number] };
  domainPoints: number;
}>();

const parentNode = inject('parentNode') as ChartNode;
const domain = computed(() => {
  const N = props.domainPoints;
  return range(0, N).map((x) => {
    const alpha = (props.x.domain[1] - props.x.domain[0]) / N;
    return x * alpha + props.x.domain[0];
  });
});
const node = reactive(currentNode());

provide('parentNode', node);
provide('domain', domain);

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
    node.data = current.data;
    parentNode.children?.push(node);
    clear(() => {
      parentNode.children = parentNode.children?.filter((item) => item !== node);
    });
  },
  { immediate: true }
);
</script>
