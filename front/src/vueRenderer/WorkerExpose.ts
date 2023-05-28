import { Component, defineComponent, h, reactive, watchEffect } from 'vue';
import { Rectangle } from '@pixi/webworker';
import { FromMainMessageKinds } from './RootTransformer';
import { createDrawData } from './UseDraw';
import { createRoot } from './PIXIRender';

export function exposeComponent(comp: Component) {
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
              return () => h(comp, props);
            },
          }),
          drawData
        );
        drawData.app = pApp;
      }
    }
  };
}
