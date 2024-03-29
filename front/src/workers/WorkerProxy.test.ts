import { fakeWorkerTalk, transfer, transferSymbol } from './WorkerProxy';

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
        return transfer(message, [message]);
      },
    });
    const buff = new Uint8Array([1, 2, 3]);
    const result = await proxy.$t([buff]).hello(buff);
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

  test('link obj', async () => {
    const proxy = fakeWorkerTalk({
      hello(message: string) {
        return {
          say() {
            return message;
          },
        };
      },
    });

    const result = await proxy.$link.hello('what');
    const say = await result.say();
    expect(say).toBe('what');
  });
});
