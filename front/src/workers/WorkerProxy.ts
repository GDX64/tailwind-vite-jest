import { Subject, firstValueFrom } from 'rxjs';

export const transferSymbol = Symbol('tranfer');

const transferMap = new WeakMap<any, Transferable[]>();

type WorkerExpose = Record<string | symbol, (...args: any) => any>;

type PromiseFn<F extends (...args: any) => any> = (
  ...args: Parameters<F>
) => Promise<Awaited<ReturnType<F>>>;

type PromiseFnProxy<F extends (...args: any) => any> = (
  ...args: Parameters<F>
) => Promise<PWorkerTransferable<Awaited<ReturnType<F>>>>;

type PWorker<W extends WorkerExpose> = {
  [K in keyof W]: PromiseFn<W[K]>;
};

type PWorkerProxy<W extends WorkerExpose> = {
  [K in keyof W]: PromiseFnProxy<W[K]>;
};

type PWorkerTransferable<W extends WorkerExpose> = PWorker<W> & {
  $t(transfer: Transferable[]): PWorker<W>;
  $terminateWorker(): void;
  $link: PWorkerProxy<W>;
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
  link?: boolean;
  linkID: number;
};

type NeededWorkerInterface = Pick<Worker, 'postMessage' | 'onmessage' | 'terminate'>;

export function createProxyWorker<W extends WorkerExpose>(
  worker: NeededWorkerInterface,
  {
    transferable = [],
    _promiseMap,
    link,
    linkID = 0,
  }: {
    transferable?: Transferable[];
    _promiseMap?: PromiseMap;
    link?: boolean;
    linkID?: number;
  } = {}
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
      has(target, key) {
        if (key === 'then') return false;
        return true;
      },
      get(_target, key) {
        if (key === '$terminateWorker') {
          return () => worker.terminate();
        }

        if (key === 'then') {
          return undefined;
        }

        if (key === '$t') {
          return (transferable: Transferable[]) =>
            createProxyWorker(worker, {
              transferable,
              _promiseMap: promiseMap,
              linkID,
              link,
            });
        }
        if (key === '$link') {
          return createProxyWorker(worker, {
            _promiseMap: promiseMap,
            transferable,
            link: true,
          });
        }
        return async (...args: any[]) => {
          const id = Math.random();
          const message: WorkerEventData = { args, id, method: key, link, linkID };
          worker.postMessage(message, transferable);
          const subject = new Subject<any>();
          promiseMap.set(id, subject);
          const result = await firstValueFrom(subject);
          if (link) {
            return createProxyWorker(worker, {
              transferable,
              _promiseMap: promiseMap,
              linkID: result,
            });
          }
          return result;
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
  const linkMap = new Map<number, any>();
  worker.onmessage = async (event: MessageEvent<WorkerEventData>) => {
    const linkObject = event.data.linkID ? linkMap.get(event.data.linkID) : messages;
    const result = await linkObject[event.data.method](...event.data.args);
    const transferable = transferMap.get(result) ?? [];
    transferMap.delete(transferable);
    if (event.data.link) {
      const linkID = Math.random();
      linkMap.set(linkID, result);
      const eventData: MainEventData = { id: event.data.id, value: linkID };
      worker.postMessage(eventData, transferable);
    } else {
      const eventData: MainEventData = { id: event.data.id, value: result };
      worker.postMessage(eventData, transferable);
    }
  };
}

export function transfer<T>(val: T, t: Transferable[]) {
  transferMap.set(val, t);
  return val;
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
