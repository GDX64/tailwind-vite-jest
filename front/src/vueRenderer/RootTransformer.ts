import {
  defineComponent,
  h,
  Component,
  watchEffect,
  watch,
  ref,
  onMounted,
  onUnmounted,
  watchPostEffect,
} from 'vue';
import GStage from './GStage.vue';
import { DrawData, createDrawData } from './UseDraw';

export function transformDrawRoot<D extends { new (): Component; props?: any }>(c: D): D {
  return defineComponent({
    props: c.props,
    setup: (props) => {
      return () => h(GStage, { comp: c, props });
    },
  }) as any;
}

export function transformWorkerRoot<D extends { new (): Component; props?: any }>(
  c: D,
  WorkerConstructor: { new (): Worker }
): D {
  return defineComponent({
    props: c.props,
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
            console.log('sending message');
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
          drawData.realWidth = canvasEl.value.width;
          drawData.realHeight = canvasEl.value.height;
          drawData.height = canvasEl.value.offsetHeight;
          drawData.width = canvasEl.value.offsetWidth;
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
        sendMessages({ type: 'drawData', value: drawData });
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
