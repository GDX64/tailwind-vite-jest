import {
  asyncScheduler,
  finalize,
  firstValueFrom,
  interval,
  map,
  observeOn,
  of,
  Subject,
  take,
  toArray,
} from 'rxjs';
import { WorkerLike } from './interfaces';
import { expose, makeProxy } from './ProxyWorker';

describe('proxyWorker', () => {
  it('echo test', async () => {
    const { workerThread, workerMain } = setup();
    const workerMethods = {
      hello(echo: string) {
        console.log('run echo');
        return of({ data: echo });
      },
    };
    expose(workerMethods, workerThread);
    const proxy = makeProxy<typeof workerMethods>(workerMain);
    const echo = await proxy.p.hello('hi');
    expect(echo).toBe('hi');
  });

  it('tests stream of data', async () => {
    const { workerThread, workerMain } = setup();
    const spy = vitest.fn();
    const workerMethods = {
      interval() {
        console.log('run echo');
        return interval(1).pipe(
          finalize(spy),
          map((x) => ({ data: x }))
        );
      },
    };
    expose(workerMethods, workerThread);
    const proxy = makeProxy<typeof workerMethods>(workerMain);
    const nums = await firstValueFrom(proxy.interval().pipe(take(3), toArray()));
    expect(nums).toEqual([0, 1, 2]);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

function setup() {
  const mainToThread = new Subject<any>();
  const threadToMain = new Subject<any>();
  mainToThread.subscribe((x) => console.log('maintothread', x));
  threadToMain.subscribe((x) => console.log('threadToMain', x));
  const workerMain: WorkerLike = {
    addEventListener: (_: string, callback: (x: any) => void) => {
      threadToMain.subscribe(callback);
    },
    postMessage: (message: any) => mainToThread.next({ data: message }),
  };

  const workerThread: WorkerLike = {
    addEventListener: (_: string, callback: (x: any) => void) => {
      mainToThread.subscribe(callback);
    },
    postMessage: (message: any) => threadToMain.next({ data: message }),
  };
  return { workerThread, workerMain };
}
