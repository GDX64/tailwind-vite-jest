import { Observable } from 'rxjs';
import { WorkerLike } from './interfaces';
import { makeProxy } from './ProxyWorker';

describe('proxyWorker', () => {
  test('echo', () => {
    const worker: WorkerLike = {
      addEventListener: vitest.fn(),
      postMessage: vitest.fn((message: any) => {}),
    };

    const proxy = makeProxy<{ hello: (x: string) => Observable<string> }>(worker);
    proxy.hello();
  });
});
