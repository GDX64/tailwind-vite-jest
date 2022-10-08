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
watchEffect(() => console.log(to.value));
watch(target, (_old, _mew, clear) => {
  if (!target.value) {
    return;
  }
  const tip = tippy(target.value, {
    onShow: (instance) => {
      to.value = instance.popper;
    },
    onHide() {
      to.value = undefined;
    },
    render() {
      console.log('render');
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
    console.log('destroyed');
    tip.destroy();
  });
});
</script>
