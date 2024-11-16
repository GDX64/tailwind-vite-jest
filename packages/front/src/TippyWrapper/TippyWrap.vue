<template>
  <span ref="localTarget">
    <slot></slot>
    <Teleport v-if="to" :to="to">
      <slot v-if="to" name="content"></slot>
    </Teleport>
  </span>
</template>

<script lang="ts" setup>
import tippy, { Instance } from 'tippy.js/headless';
import { computed, ref, useSlots, watch, watchEffect } from 'vue';

const localTarget = ref<HTMLElement>();
const to = ref<Element>();
const emit = defineEmits<{ (event: 'show'): void }>();
const props = defineProps<{
  target?: HTMLElement;
  triggerTarget?: HTMLElement;
  trigger?: string;
  show?: boolean;
  delay?: number | [number, number];
}>();
const finalTarget = computed(() => props.target ?? localTarget.value);
const tip = ref<Instance<any>>();
console.log(useSlots());
watchEffect(() => {
  if (props.show) {
    tip.value?.show();
  } else {
    tip.value?.hide();
  }
});
watch(finalTarget, (_now, _old, clear) => {
  if (!finalTarget.value) {
    return;
  }
  tip.value = tippy(finalTarget.value, {
    onShow: (instance) => {
      emit('show');
      to.value = instance.popper;
    },
    onHide() {
      to.value = undefined;
    },
    render() {
      return { popper: document.createElement('div') };
    },
    offset: [0, 0],
    placement: 'bottom',
    theme: 'dark',
    interactive: true,
    trigger: props.trigger,
    appendTo: () => document.body,
    triggerTarget: props.triggerTarget,
    delay: props.delay,
  });
  clear(() => {
    tip.value?.destroy();
  });
});
</script>
