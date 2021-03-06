import { Observable } from 'rxjs';
import { Requester } from './interfaces';

export default class RequesterToObs {
  constructor(private requester: Requester) {}

  tickersOf(ticker: string): Observable<string[]> {
    return new Observable((sub$) => {
      this.requester.requestTicker(
        ticker,
        (r) => sub$.next(r),
        (err) => sub$.error(err)
      );
    });
  }

  coinConversion(coin: string): Observable<number> {
    return new Observable((sub$) => {
      const id = this.requester.conversion('BRL', coin, (r) => sub$.next(r));
      return () => this.requester.unsubConversion(coin, id);
    });
  }
  quotationOf(ticker: string): Observable<number> {
    return new Observable((sub$) => {
      const id = this.requester.subscribeQuotation(ticker, (n) => sub$.next(n));
      return () => {
        this.requester.unsubscribeQuotation(id, ticker);
      };
    });
  }
}
