import { toBase64 } from './toBase64';

describe('toBase64', () => {
  it('should return a base64 string', () => {
    const uint8array = new TextEncoder().encode('Hello World!');
    const base64 = toBase64(uint8array);
    expect(base64).toBe('SGVsbG8gV29ybGQh');
  });

  it('should have the same results as native node Buffer methods', () => {
    const randomString = [...Array(15)].map(() => Math.floor(Math.random() * 0xff));
    const uint8array = new Uint8Array(randomString);
    const base64 = toBase64(uint8array);
    const nodeAnswer = Buffer.from(uint8array).toString('base64');
    expect(base64).toBe(nodeAnswer);
  });
});
