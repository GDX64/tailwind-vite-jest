import {
  defer,
  endWith,
  filter,
  finalize,
  map,
  mergeMap,
  Observable,
  Subject,
  takeUntil,
  takeWhile,
} from 'rxjs';
import { FinishStream, GenericGet, GenericRequest } from './interfaces';

export function makeProxy<T extends {}>(worker: Worker): T {
  const get$ = new Subject<GenericGet>();
  worker.addEventListener('message', (message) => {
    if (message.data.type === 'get') {
      get$.next(message.data);
    }
  });
  return new Proxy({} as T, {
    get(target, prop: string) {
      return (arg: any, transfer: any) => {
        return defer(() => {
          const id = Math.random();
          const genericRequest: GenericRequest = { type: 'func', prop, arg, id };
          worker.postMessage(genericRequest, transfer);
          return get$.pipe(
            finalize(() => {
              worker.postMessage({ type: 'finish', id });
            }),
            filter((resp) => id === resp.id),
            takeWhile((resp) => !resp.last),
            map((resp) => resp.response)
          );
        });
      };
    },
  });
}

type WorkerMethodsRecord = Record<
  string,
  (x: any) => Observable<{ data: any; transfer?: Transferable[] }>
>;

export function expose(methods: WorkerMethodsRecord) {
  const func$ = new Subject<GenericRequest>();
  const finish$ = new Subject<number>();
  self.addEventListener('message', (message) => {
    const data = message.data as GenericRequest | FinishStream;
    if (data.type === 'func') {
      func$.next(data);
    } else if (data.type === 'finish') {
      finish$.next(data.id);
    }
  });
  func$
    .pipe(mergeMap((data) => makeGenericRequest(data, finish$, methods)))
    .subscribe((data) => self.postMessage(data, (data.transfer as any) ?? []));
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

  return methods[data.prop](data.arg).pipe(
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
