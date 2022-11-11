import { Application } from '@pixi/webworker';

const worker = self as any as Worker;

worker.addEventListener('message', (event) => {
  const { off } = event.data;
  const app = new Application<HTMLCanvasElement>({
    view: off as HTMLCanvasElement,
    backgroundColor: 0xff0000,
  });
});
