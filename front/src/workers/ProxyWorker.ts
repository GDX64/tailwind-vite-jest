import {
  defer,
  endWith,
  filter,
  finalize,
  firstValueFrom,
  map,
  mergeMap,
  Observable,
  Subject,
  takeUntil,
  takeWhile,
  tap,
} from 'rxjs';
import {
  FinishStream,
  GenericGet,
  GenericRequest,
  StartStream,
  WorkerLike,
} from './interfaces';

type WorkerObservableFn =
  | ((...x: any[]) => Observable<any>)
  | ((...x: any[]) => Observable<{ data: any; transfer: Transferable[] }>);

type ExtractData<T> = T extends (x: any) => Observable<{ data: infer A; transfer: any }>
  ? A
  : T extends (x: any) => Observable<infer B>
  ? B
  : never;
type TransformRecord<T extends Record<string, WorkerObservableFn>> = {
  [Key in keyof T]: (...args: Parameters<T[Key]>) => Observable<ExtractData<T[Key]>>;
};

export type WorkerProxy<
  T extends Record<string, WorkerObservableFn>,
  Full = true
> = TransformRecord<T> & {
  p: {
    [Key in keyof T]: (...args: Parameters<T[Key]>) => Promise<ExtractData<T[Key]>>;
  };
} & (Full extends true
    ? {
        t(transfer: Transferable[]): WorkerProxy<T, false>;
        terminate(): void;
      }
    : {});

type TransferArg<T> = {
  args: T;
  tranfer?: Transferable[];
};
export function makeProxy<F extends () => Record<string, WorkerObservableFn>>(
  worker: WorkerLike
): WorkerProxy<ReturnType<F>>;
export function makeProxy<F extends (x: any) => Record<string, WorkerObservableFn>>(
  worker: WorkerLike,
  arg: TransferArg<Parameters<F>[0]>
): WorkerProxy<ReturnType<F>>;
export function makeProxy<F extends (args?: any) => Record<string, WorkerObservableFn>>(
  worker: WorkerLike,
  arg?: TransferArg<Parameters<F>[0]>
): WorkerProxy<ReturnType<F>> {
  const get$ = new Subject<GenericGet>();
  worker.addEventListener('message', (message) => {
    if (message.data.type === 'get') {
      get$.next(message.data);
    }
  });
  const startMessage: StartStream = { arg: arg?.args, type: 'start', id: 0 };
  arg?.tranfer
    ? worker.postMessage(startMessage, arg.tranfer)
    : worker.postMessage(startMessage);

  function makeGetObs(prop: any, args: any[], transfer: any) {
    return defer(() => {
      const id = Math.random();
      const genericRequest: GenericRequest = { type: 'func', prop, args, id };
      queueMicrotask(() => worker.postMessage(genericRequest, transfer));
      return get$.pipe(
        finalize(() => worker.postMessage({ type: 'finish', id })),
        filter((resp) => id === resp.id),
        takeWhile((resp) => !resp.last),
        map((resp) => resp.response)
      );
    });
  }

  return new Proxy({} as WorkerProxy<ReturnType<F>>, {
    get(target, prop: string) {
      if (prop === 'p') {
        return makePProxy(makeGetObs);
      }
      if (prop === 't') {
        return (transfer: Transferable[]) => makeTransferProxy(makeGetObs, transfer);
      }
      if (prop === 'terminate') {
        return () => worker.terminate();
      }
      return (...arg: any[]) => makeGetObs(prop, arg, []);
    },
  });
}

function makeTransferProxy(
  makeGetObs: (prop: any, arg: any, transfer: any) => Observable<any>,
  transfer: Transferable[]
) {
  return new Proxy({} as any, {
    get(target, prop: string) {
      if (prop === 'p') {
        return makePProxy((prop, arg) => makeGetObs(prop, arg, transfer));
      }
      return (...args: any[]) => makeGetObs(prop, args, transfer);
    },
  });
}

function makePProxy(
  makeGetObs: (prop: any, arg: any, transfer: any) => Observable<any>
): any {
  return new Proxy(
    {},
    {
      get(target, prop: string) {
        return (...arg: any[]) => firstValueFrom(makeGetObs(prop, arg, []));
      },
    }
  );
}

type WorkerMethodsRecord = Record<string, WorkerObservableFn>;
type MethodsFac = (arg?: any) => WorkerMethodsRecord;
export function expose(methodsFac: MethodsFac, ctx: WorkerLike) {
  const func$ = new Subject<GenericRequest>();
  const finish$ = new Subject<number>();
  ctx.addEventListener('message', (message) => {
    const data = message.data as GenericRequest | FinishStream | StartStream;
    if (data.type === 'func') {
      func$.next(data);
    } else if (data.type === 'finish') {
      finish$.next(data.id);
    } else if (data.type === 'start') {
      const methods = methodsFac(data.arg);
      func$
        .pipe(mergeMap((data) => makeGenericRequest(data, finish$, methods)))
        .subscribe((data) => ctx.postMessage(data, data.transfer ?? []));
    }
  });
}

function makeGenericRequest(
  data: GenericRequest,
  finish$: Observable<number>,
  methods: WorkerMethodsRecord
) {
  const endMessage: GenericGet = {
    id: data.id,
    last: true,
    response: null,
    type: 'get',
  };

  return methods[data.prop](...data.args).pipe(
    takeUntil(finish$.pipe(filter((id) => id === data.id))),
    map((answer): GenericGet => {
      return {
        id: data.id,
        last: false,
        response: answer?.transfer ? answer.data : answer,
        type: 'get',
        transfer: answer?.transfer ?? [],
      };
    }),
    endWith(endMessage)
  );
}

export function makeFallback<T extends WorkerMethodsRecord>(rec: T) {
  const { workerMain, workerThread } = setupSingleThread();
  expose(() => rec, workerThread);
  return makeProxy(workerMain);
}

export function setupSingleThread() {
  const mainToThread = new Subject<any>();
  const threadToMain = new Subject<any>();
  const workerMain: WorkerLike = {
    addEventListener: (_: string, callback: (x: any) => void) => {
      threadToMain.subscribe(callback);
    },
    postMessage: (message: any) => mainToThread.next({ data: message }),
    terminate() {},
  };

  const workerThread: WorkerLike = {
    addEventListener: (_: string, callback: (x: any) => void) => {
      mainToThread.subscribe(callback);
    },
    postMessage: (message: any) => threadToMain.next({ data: message }),
    terminate() {},
  };
  return { workerThread, workerMain };
}
