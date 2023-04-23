import { Subject, firstValueFrom } from 'rxjs';

type WorkerExpose = Record<string | symbol, (...args: any) => any>;

type PromiseFn<F extends (...args: any) => any> = (
  ...args: Parameters<F>
) => ReturnType<F> extends Promise<any> ? ReturnType<F> : Promise<ReturnType<F>>;

type PWorker<W extends WorkerExpose> = {
  [K in keyof W]: PromiseFn<W[K]>;
};

type PWorkerTransferable<W extends WorkerExpose> = PWorker<W> & {
  t(transfer: Transferable[]): PWorker<W>;
  terminateWorker(): void;
};

type PromiseMap = Map<number, Subject<any>>;

type MainEventData = {
  value: any;
  id: number;
};

type WorkerEventData = {
  args: any[];
  id: number;
  method: string | symbol;
};

type NeededWorkerInterface = Pick<Worker, 'postMessage' | 'onmessage' | 'terminate'>;

export function createProxyWorker<W extends WorkerExpose>(
  worker: NeededWorkerInterface,
  {
    transferable = [],
    _promiseMap,
  }: { transferable?: Transferable[]; _promiseMap?: PromiseMap } = {}
): PWorkerTransferable<W> {
  const promiseMap: PromiseMap = _promiseMap ? _promiseMap : new Map();
  if (!_promiseMap) {
    worker.onmessage = (event: MessageEvent<MainEventData>) => {
      promiseMap.get(event.data.id)?.next(event.data.value);
      promiseMap.delete(event.data.id);
    };
  }
  return new Proxy(
    {},
    {
      get(_target, key) {
        if (key === 'terminateWorker') {
          return () => worker.terminate();
        }
        if (key === 't') {
          return (transferable: Transferable[]) =>
            createProxyWorker(worker, { transferable, _promiseMap: promiseMap });
        }
        return (...args: any[]) => {
          const id = Math.random();
          const message: WorkerEventData = { args, id, method: key };
          worker.postMessage(message, transferable);
          const subject = new Subject<any>();
          promiseMap.set(id, subject);
          return firstValueFrom(subject);
        };
      },
      set() {
        return true;
      },
    }
  ) as any;
}

export function exposeToWorker<W extends WorkerExpose>(
  messages: W,
  worker: NeededWorkerInterface = self as any
) {
  worker.onmessage = async (event: MessageEvent<WorkerEventData>) => {
    const result = await messages[event.data.method](...event.data.args);
    const eventData: MainEventData = { id: event.data.id, value: result };
    worker.postMessage(eventData);
  };
}

export function fakeWorkerTalk<W extends WorkerExpose>(expose: W) {
  const mainSend$ = new Subject<any>();
  const workerSend$ = new Subject<any>();
  const main: NeededWorkerInterface = {
    postMessage(args) {
      queueMicrotask(() => {
        mainSend$.next({ data: args });
      });
    },
    onmessage: () => {},
    terminate() {},
  };
  const worker: NeededWorkerInterface = {
    postMessage(args) {
      queueMicrotask(() => {
        workerSend$.next({ data: args });
      });
    },
    onmessage: () => {},
    terminate() {},
  };

  const proxy = createProxyWorker<W>(main);
  exposeToWorker(expose, worker);

  const workerSub = mainSend$.subscribe((message) => {
    (worker as any).onmessage?.(message);
  });
  const mainSub = workerSend$.subscribe((message) => {
    (main as any).onmessage?.(message);
  });

  main.terminate = () => {
    workerSub.unsubscribe();
    mainSub.unsubscribe();
  };
  return proxy;
}
