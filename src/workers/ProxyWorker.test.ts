import { firstValueFrom, Observable, of, Subject } from 'rxjs';
import { GenericGet, WorkerLike } from './interfaces';
import { expose, makeProxy } from './ProxyWorker';

describe('proxyWorker', () => {
  test('echo', () => {
    const mainToThread = new Subject<any>();
    const threadToMain = new Subject<any>();
    const workerMain: WorkerLike = {
      addEventListener: (_: string, callback: (x: any) => void) => {
        threadToMain.subscribe(callback);
      },
      postMessage: (message: any) => mainToThread.next(message),
    };

    const workerThread: WorkerLike = {
      addEventListener: (_: string, callback: (x: any) => void) => {
        mainToThread.subscribe(callback);
      },
      postMessage: (message: any) => threadToMain.next(message),
    };

    const workerMethods = {
      hello(echo: string) {
        return of({ data: echo });
      },
    };

    expose(workerMethods, workerThread);
    const proxy = makeProxy<typeof workerMethods>(workerMain);

    const echo = firstValueFrom(proxy.hello('hi'));
    console.log(echo);
  });
});
