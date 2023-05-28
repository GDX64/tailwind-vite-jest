import {
  defineComponent,
  h,
  Component,
  watch,
  ref,
  onMounted,
  onUnmounted,
  watchPostEffect,
} from 'vue';
import GStage from './GStage.vue';
import { DrawData, createDrawData } from './UseDraw';

export function transformWorkerRoot<D extends { new (): Component; props?: any }>(
  comp: D,
  WorkerConstructor: { new (): Worker },
  main = false
): D {
  if (main) {
    return defineComponent({
      props: comp.props,
      setup: (props, ctx) => {
        return () =>
          h(GStage, null, {
            default: () => h(comp, props),
          });
      },
    }) as any;
  }

  return defineComponent({
    props: comp.props,
    setup: (props, ctx) => {
      const worker = new WorkerConstructor();
      const sendMessages = (message: FromMainMessageKinds, transfer?: Transferable[]) =>
        worker.postMessage(message, transfer ?? []);
      const propsRecord = props as any;
      const canvasEl = ref<HTMLCanvasElement>();

      Object.keys(props).forEach((key) => {
        watch(
          () => propsRecord[key],
          (now) => {
            sendMessages({ type: 'props', key, value: now });
          },
          { immediate: true }
        );
      });

      onMounted(() => {
        const offCanvas = canvasEl.value?.transferControlToOffscreen?.();
        if (offCanvas) {
          sendMessages({ type: 'canvas', value: offCanvas, devicePixelRatio }, [
            offCanvas,
          ]);
        }
      });

      const drawData = createDrawData();
      const obs = new ResizeObserver(() => {
        if (canvasEl.value) {
          drawData.realHeight = canvasEl.value.offsetHeight * devicePixelRatio;
          drawData.realWidth = canvasEl.value.offsetWidth * devicePixelRatio;
          drawData.width = canvasEl.value.offsetWidth;
          drawData.height = canvasEl.value.offsetHeight;
          drawData.devicePixelRatio = devicePixelRatio;
        }
      });

      const intersect = new IntersectionObserver((entries) => {
        entries.forEach((entry) => (drawData.isVisible = entry.isIntersecting));
      });

      onMounted(() => {
        intersect.observe(canvasEl.value!);
        obs.observe(canvasEl.value!);
      });

      onUnmounted(() => {
        obs.disconnect();
        intersect.disconnect();
      });

      watchPostEffect(() => {
        sendMessages({ type: 'drawData', value: { ...drawData } });
      });

      return () => h('canvas', { ref: canvasEl });
    },
  }) as any;
}

export type FromMainMessageKinds =
  | {
      type: 'props';
      key: string;
      value: any;
    }
  | {
      type: 'canvas';
      value: OffscreenCanvas;
      devicePixelRatio: number;
    }
  | {
      type: 'drawData';
      value: DrawData;
    };
