import PixiSquare from '../../vueRenderer/BaseComponents/PixiSquare.vue';
import { createRoot } from '../../vueRenderer/PIXIRender';
import { FromMainMessageKinds } from '../../vueRenderer/RootTransformer';
import { createDrawData } from '../../vueRenderer/UseDraw';

self.onmessage = (message) => {
  const data: FromMainMessageKinds = message.data;
  switch (data.type) {
    case 'props':
    case 'canvas': {
      const drawData = createDrawData();
      createRoot(data.value, PixiSquare, drawData);
    }
  }
};
