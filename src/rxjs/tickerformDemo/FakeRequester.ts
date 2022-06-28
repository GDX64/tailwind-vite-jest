import {
  concat,
  interval,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
  timer,
} from 'rxjs';
import { Requester } from './interfaces';

const tickers = ['BTC', 'BCH', 'BTG', 'BTA', 'ETH', 'ETC', 'ETX', 'ADA', 'ADD'];

const absoluteQuotation = new Map([
  ['BRL', 1],
  ['USD', 5],
  ['ARS', 0.1],
]);

export default class FakeRequester implements Requester {
  private quotationID = 0;
  private quotationSubs = new Map<number, Subscription>();
  requestTicker(
    ticker: string,
    response: (r: string[]) => void,
    error: (err: Error) => void
  ) {
    const filtered = tickers.filter((item) => item.includes(ticker.toUpperCase()));
    setTimeout(() => response(filtered), 500);
  }

  subscribeQuotation(ticker: string, response: (n: number) => void) {
    this.quotationSubs.set(
      this.quotationID++,
      randomTimeEmit(() => Math.random() * 1000)
        .pipe(map(() => Math.random() * 20))
        .subscribe(response)
    );
    return this.quotationID;
  }

  unsubscribeQuotation(id: number) {
    console.log('unsub', id);
    this.quotationSubs.get(id)?.unsubscribe();
    this.quotationSubs.delete(id);
  }

  conversion(from: string, to: string, response: (n: number) => void) {
    const nFrom = absoluteQuotation.get(from);
    const nTo = absoluteQuotation.get(to);
    if (nFrom && nTo) {
      return setTimeout(() => response(nFrom / nTo), 500);
    }
  }
}

function randomTimeEmit(time: () => number): Observable<0> {
  return new Observable((sub$) => {
    let timeout: any = -1;
    const randomTime = () => {
      timeout = setTimeout(() => {
        sub$.next(0);
        randomTime();
      }, time());
    };
    randomTime();
    return () => clearTimeout(timeout);
  });
}
