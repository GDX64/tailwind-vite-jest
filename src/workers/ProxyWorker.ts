import { defer, filter, finalize, map, Observable, Subject, takeWhile } from 'rxjs';

function makeProxy<T extends {}>(worker: Worker): T {
  const get$ = new Subject<GenericGet>();
  worker.addEventListener('message', (message) => {
    if (message.data.type === 'get') {
      get$.next(message.data);
    }
  });
  return new Proxy({} as T, {
    get(target, prop) {
      return (arg: any, transfer: any) => {
        return defer(() => {
          const id = Math.random();
          worker.postMessage({ type: 'func', prop, arg, id }, transfer);
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

interface Talker {
  hello(x: number): Observable<number>;
}

function use() {
  makeProxy<Talker>({} as any).hello(10);
}

type GenericGet = {
  response: any;
  id: number;
  type: string;
  last: boolean;
};
