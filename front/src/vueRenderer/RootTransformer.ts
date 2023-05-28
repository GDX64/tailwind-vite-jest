import { defineComponent, h, Component, watchEffect, watch, ref, onMounted } from 'vue';
import GStage from './GStage.vue';

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
      const canvasRef = ref<HTMLCanvasElement>();

      Object.keys(props).forEach((key) => {
        watch(
          () => [propsRecord[key], canvasRef.value] as const,
          ([now]) => {
            console.log('sending message');
            sendMessages({ type: 'props', key, value: now });
          },
          { flush: 'post' }
        );
      });

      onMounted(() => {
        const offCanvas = canvasRef.value?.transferControlToOffscreen?.();
        if (offCanvas) {
          sendMessages({ type: 'canvas', value: offCanvas }, [offCanvas]);
        }
      });

      return () => h('canvas', { ref: canvasRef });
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
    };
