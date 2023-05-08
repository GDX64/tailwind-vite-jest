import { defineComponent, h, Component, watchEffect } from 'vue';
import GStage from './GStage.vue';

export function transformDrawRoot<D extends { new (): Component; props?: any }>(c: D): D {
  return defineComponent({
    props: c.props,
    setup: (props) => {
      return () => h(GStage, { comp: c, props });
    },
  }) as any;
}
