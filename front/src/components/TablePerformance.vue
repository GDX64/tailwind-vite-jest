<template>
  <canvas
    ref="canvas"
    width="600"
    height="500"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
  </canvas>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import Worker from '../workers/OffCanvas?worker';
import { makeProxy, makeFallback } from '../workers/ProxyWorker';
import { createOffCanvasInst } from '../workers/OffCanvasInst';
import { tableTest } from '../pixijs/hello/pixiTable';
const props = defineProps<{ testKind: 'canvas' | 'Offscreen' | 'PIXIOff' | 'PIXI' }>();
const onMouseMove = ref((_arg: MouseEvent) => {});
const onMouseLeave = ref((_arg: MouseEvent) => {});
const canvas = ref<HTMLCanvasElement>();
watchEffect((clear) => {
  if (props.testKind === 'PIXI') {
    clear(tableTest(canvas.value!, 1));
    return;
  }
  const worker = createWorker();
  if (!worker) return;
  onMouseMove.value = (event) => {
    worker.p.mousePos([event.offsetX, event.offsetY]);
  };

  onMouseLeave.value = () => worker.p.mousePos(null);

  if (props.testKind === 'PIXIOff') {
    worker.p.pixi(devicePixelRatio);
  } else {
    const sub = worker.startCanvas().subscribe();
    clear(() => {
      sub.unsubscribe();
      worker.terminate();
    });
  }
});

function createWorker() {
  const off =
    props.testKind !== 'canvas' && props.testKind !== 'PIXI'
      ? canvas.value?.transferControlToOffscreen?.()
      : null;
  if (off) {
    return makeProxy<typeof createOffCanvasInst>(new Worker(), {
      args: off,
      tranfer: [off as any],
    });
  }
  if (canvas.value) {
    return makeFallback(createOffCanvasInst(canvas.value));
  }
  return null;
}
</script>

<style></style>
