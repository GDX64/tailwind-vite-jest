/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />

import { GLineType } from './vueRenderer/componentTypes';
declare module '*.vue' {
  import { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '*.svg' {
  import { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '*.glsl' {
  const code: string;
  export default code;
}

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    gline: GLineType;
  }
}
