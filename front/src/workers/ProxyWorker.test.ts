import { finalize, firstValueFrom, interval, of, Subject, take, toArray } from 'rxjs';
import { WorkerLike } from './interfaces';
import { expose, makeProxy, setupSingleThread } from './ProxyWorker';

describe('proxyWorker', () => {
  it('echo test', async () => {
    const { workerThread, workerMain } = setupSingleThread();
    const workerMethods = () => ({
      hello(...echo: string[]) {
        return of(echo);
      },
    });
    expose(workerMethods, workerThread);

    const proxy = makeProxy<typeof workerMethods>(workerMain);
    const echo = await proxy.p.hello('hi');
    expect(echo).toEqual(['hi']);

    const multipleArgs = await proxy.p.hello('hello', 'darkness');
    expect(multipleArgs).toEqual(['hello', 'darkness']);
  });

  it('tests construction', async () => {
    const { workerThread, workerMain } = setupSingleThread();
    const factoryFn = (thing: string) => ({
      hello: () => of(thing),
    });
    expose(factoryFn, workerThread);
    const proxy = makeProxy<typeof factoryFn>(workerMain, { args: 'holla' });
    const val = await proxy.p.hello();
    expect(val).toBe('holla');
  });

  it('tests transfer', async () => {
    const { workerThread, workerMain } = setupSingleThread();
    function hello(...echo: string[]) {
      return of({ data: echo, transfer: [] });
    }
    const workerMethods = () => ({ hello });
    expose(workerMethods, workerThread);

    const proxy = makeProxy<typeof workerMethods>(workerMain);
    const echo = await proxy.t([]).p.hello('hi');
    expect(echo).toEqual(['hi']);

    const multipleArgs = await proxy.t([]).p.hello('hello', 'darkness');
    expect(multipleArgs).toEqual(['hello', 'darkness']);
  });

  it('tests stream of data', async () => {
    const { workerThread, workerMain } = setupSingleThread();
    const spy = vitest.fn();
    const workerMethods = () => ({
      interval() {
        return interval(1).pipe(finalize(spy));
      },
    });
    expose(workerMethods, workerThread);
    const proxy = makeProxy<typeof workerMethods>(workerMain);
    const nums = await firstValueFrom(proxy.interval().pipe(take(3), toArray()));
    expect(nums).toEqual([0, 1, 2]);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('terminates', () => {
    const { workerThread } = setupSingleThread();
    workerThread.terminate = vitest.fn();
    const proxy = makeProxy<() => {}>(workerThread);
    proxy.terminate();
    expect(workerThread.terminate).toBeCalledTimes(1);
  });
});
