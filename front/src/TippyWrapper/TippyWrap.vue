<template>
  <div ref="target" class="w-fit">
    <slot></slot>
  </div>
  <Teleport v-if="to" :to="to">
    <slot v-if="to" name="content"></slot>
  </Teleport>
</template>

<script lang="ts" setup>
import tippy from 'tippy.js/headless';
import { ref, watch, watchEffect } from 'vue';
const target = ref<HTMLElement>();
const to = ref<Element>();
const emit = defineEmits<{ (event: 'show'): void }>();
watch(target, (_old, _mew, clear) => {
  if (!target.value) {
    return;
  }
  const tip = tippy(target.value, {
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
    trigger: 'click',
    appendTo: () => document.body,
  });
  clear(() => {
    tip.destroy();
  });
});
</script>
