import { defineComponent, h, reactive, watchEffect } from 'vue';
import PixiSquare from '../../vueRenderer/BaseComponents/PixiSquare.vue';
import { createRoot } from '../../vueRenderer/PIXIRender';
import { FromMainMessageKinds } from '../../vueRenderer/RootTransformer';
import { createDrawData } from '../../vueRenderer/UseDraw';
import { Application, Rectangle } from '@pixi/webworker';

const props: any = reactive({});
const drawData = createDrawData();

self.onmessage = (message) => {
  const data: FromMainMessageKinds = message.data;
  switch (data.type) {
    case 'drawData': {
      const { app, ...sizeData } = data.value;
      Object.assign(drawData, sizeData);
      return;
    }
    case 'props':
      props[data.key] = data.value;
      return;
    case 'canvas': {
      drawData.devicePixelRatio = data.devicePixelRatio;
      const { pApp } = createRoot(
        data.value,
        defineComponent({
          setup() {
            watchEffect(() => {
              if (drawData.app) {
                drawData.app.view.width = drawData.realWidth;
                drawData.app.view.height = drawData.realHeight;
                drawData.app.screen.copyFrom(
                  new Rectangle(0, 0, drawData.width, drawData.height)
                );
              }
            });
            return () => h(PixiSquare, props);
          },
        }),
        drawData
      );
      drawData.app = pApp;
    }
  }
};
