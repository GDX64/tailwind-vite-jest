import { defineComponent, h, reactive, watchEffect } from 'vue';
import PixiSquare from '../../vueRenderer/BaseComponents/PixiSquare.vue';
import { createRoot } from '../../vueRenderer/PIXIRender';
import { FromMainMessageKinds } from '../../vueRenderer/RootTransformer';
import { createDrawData } from '../../vueRenderer/UseDraw';
import { Application } from 'pixi.js';

const props: any = reactive({});
const drawData = createDrawData();
let pApp: Application | null = null;

self.onmessage = (message) => {
  const data: FromMainMessageKinds = message.data;
  switch (data.type) {
    case 'drawData': {
      Object.assign(drawData, data.value);
      pApp?.resize();
      return;
    }
    case 'props':
      props[data.key] = data.value;
      return;
    case 'canvas': {
      drawData.devicePixelRatio = data.devicePixelRatio;
      const root = createRoot(
        data.value,
        defineComponent({
          setup() {
            return () => h(PixiSquare, props);
          },
        }),
        drawData
      );
      pApp = root.pApp;
    }
  }
};
