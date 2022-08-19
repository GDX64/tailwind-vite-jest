import { finalize, firstValueFrom, interval, of, Subject, take, toArray } from 'rxjs';
import { WorkerLike } from './interfaces';
import { expose, makeProxy } from './ProxyWorker';

describe('proxyWorker', () => {
  it('echo test', async () => {
    const { workerThread, workerMain } = setup();
    const workerMethods = {
      hello(...echo: string[]) {
        return of(echo);
      },
    };
    expose(workerMethods, workerThread);

    const proxy = makeProxy<typeof workerMethods>(workerMain);
    const echo = await proxy.p.hello('hi');
    expect(echo).toEqual(['hi']);

    const multipleArgs = await proxy.p.hello('hello', 'darkness');
    expect(multipleArgs).toEqual(['hello', 'darkness']);
  });

  it('tests transfer', async () => {
    const { workerThread, workerMain } = setup();
    function hello(...echo: string[]) {
      return of({ data: echo, transfer: [] });
    }
    const workerMethods = { hello };
    expose(workerMethods, workerThread);

    const proxy = makeProxy<typeof workerMethods>(workerMain);
    const echo = await proxy.t([]).p.hello('hi');
    expect(echo).toEqual(['hi']);

    const multipleArgs = await proxy.t([]).p.hello('hello', 'darkness');
    expect(multipleArgs).toEqual(['hello', 'darkness']);
  });

  it('tests stream of data', async () => {
    const { workerThread, workerMain } = setup();
    const spy = vitest.fn();
    const workerMethods = {
      interval() {
        return interval(1).pipe(finalize(spy));
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
