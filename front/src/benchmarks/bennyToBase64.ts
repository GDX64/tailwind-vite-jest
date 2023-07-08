import { add, cycle, suite, complete } from 'benny';
import { toBase64 } from './toBase64';

const randomString = new Uint8Array(
  [...Array(10_000_000)].map(() => Math.floor(Math.random() * 0xff))
);

const buffer = Buffer.from(randomString);

suite(
  'toBase64',
  add('toBase64JS', () => {
    toBase64(randomString);
  }),
  add('toBase64Node', () => {
    buffer.toString('base64');
  }),
  cycle(),
  complete()
);
