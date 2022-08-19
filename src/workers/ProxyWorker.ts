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
import { FinishStream, GenericGet, GenericRequest, WorkerLike } from './interfaces';

type WorkerObservableFn = (
  ...x: any[]
) => Observable<{ data: any; transfer?: Transferable[] }>;

type ExtractData<T> = T extends (x: any) => Observable<{ data: infer A }> ? A : never;
type TransformRecord<T extends Record<string, WorkerObservableFn>> = {
  [Key in keyof T]: (...args: Parameters<T[Key]>) => Observable<ExtractData<T[Key]>>;
};

type WorkerProxy<
  T extends Record<string, WorkerObservableFn>,
  Transfer = true
> = TransformRecord<T> & {
  p: {
    [Key in keyof T]: (...args: Parameters<T[Key]>) => Promise<ExtractData<T[Key]>>;
  };
} & (Transfer extends true
    ? {
        t(transfer: Transferable[]): WorkerProxy<T, false>;
      }
    : {});

export function makeProxy<T extends Record<string, WorkerObservableFn>>(
  worker: WorkerLike
): WorkerProxy<T> {
  const get$ = new Subject<GenericGet>();
  worker.addEventListener('message', (message) => {
    if (message.data.type === 'get') {
      get$.next(message.data);
    }
  });

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

  return new Proxy({} as WorkerProxy<T>, {
    get(target, prop: string) {
      if (prop === 'p') {
        return makePProxy(makeGetObs);
      }
      if (prop === 't') {
        return (transfer: Transferable[]) => makeTransferProxy(makeGetObs, transfer);
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

export function expose(methods: WorkerMethodsRecord, ctx: WorkerLike) {
  const func$ = new Subject<GenericRequest>();
  const finish$ = new Subject<number>();
  ctx.addEventListener('message', (message) => {
    const data = message.data as GenericRequest | FinishStream;
    if (data.type === 'func') {
      func$.next(data);
    } else if (data.type === 'finish') {
      finish$.next(data.id);
    }
  });
  func$
    .pipe(mergeMap((data) => makeGenericRequest(data, finish$, methods)))
    .subscribe((data) => ctx.postMessage(data, data.transfer ?? []));
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
        response: answer.data,
        type: 'get',
        transfer: answer.transfer,
      };
    }),
    endWith(endMessage)
  );
}
