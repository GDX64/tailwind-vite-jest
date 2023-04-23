import { fakeWorkerTalk } from './WorkerProxy';

describe('simple send', () => {
  test('echo send', async () => {
    const proxy = fakeWorkerTalk({
      hello(message: string) {
        return message;
      },
    });
    const sentMessage = 'a test';
    const result = await proxy.hello(sentMessage);
    expect(result).toBe(sentMessage);
  });
  test('echo send transfer', async () => {
    const proxy = fakeWorkerTalk({
      hello(message: Uint8Array) {
        return message;
      },
    });
    const buff = new Uint8Array([1, 2, 3]);
    const result = await proxy.t([buff]).hello(buff);
    expect(buff).toBe(result);
  });
  test('echo async', async () => {
    const proxy = fakeWorkerTalk({
      hello(message: string) {
        return Promise.resolve(message);
      },
    });
    const sentMessage = 'a test';
    const result = await proxy.hello(sentMessage);
    expect(result, sentMessage);
  });
});
