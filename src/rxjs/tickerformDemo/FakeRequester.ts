import { interval, map, Subscription } from 'rxjs';
import { Requester } from './interfaces';

const tickers = ['BTC', 'BCH', 'BTG', 'BTA', 'ETH', 'ETC', 'ETX', 'ADA', 'ADD'];

export default class FakeRequester implements Requester {
  private quotationID = 0;
  private quotationSubs = new Map<number, Subscription>();
  requestTicker(
    ticker: string,
    response: (r: string[]) => void,
    error: (err: Error) => void
  ) {
    setTimeout(() => response(tickers.filter((item) => item.includes(ticker))), 500);
  }

  subscribeQuotation(ticker: string, response: (n: number) => void) {
    this.quotationSubs.set(
      this.quotationID++,
      interval(500)
        .pipe(map(() => Math.random() * 100))
        .subscribe(response)
    );
    return this.quotationID;
  }

  unsubscribeQuotation(id: number) {
    this.quotationSubs.get(id)?.unsubscribe();
    this.quotationSubs.delete(id);
  }

  conversion(from: string, to: string, response: (n: number) => void) {
    response(Math.random() * 10);
  }
}
