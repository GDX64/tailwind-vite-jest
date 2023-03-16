<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { inject, watch, Ref, reactive, computed } from 'vue';
import { ChartNode, RectNode, ChartType, LineNode } from './CartesianCharts';

const props = defineProps<{
  fn: (x: number) => number;
  color: string;
}>();

const parentNode = inject('parentNode') as ChartNode;
const domain = inject('domain') as Ref<number[]>;

const pairs = computed(() => {
  return domain.value.map((num) => [num, props.fn(num)] as [number, number]);
});

console.log(parentNode);
function currentNode(): LineNode {
  return {
    data: {
      points: pairs.value,
      color: props.color,
    },
    type: ChartType.LINE,
    events: {},
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
