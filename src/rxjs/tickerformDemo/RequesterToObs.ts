import { Observable } from 'rxjs';
import { Requester } from './interfaces';

export default class RequesterToObs {
  constructor(private requester: Requester) {}

  tickerFromRequester(ticker: string): Observable<string[]> {
    return new Observable((sub$) => {
      console.log('sub');
      this.requester.requestTicker(
        ticker,
        (r) => sub$.next(r),
        (err) => sub$.error(err)
      );
    });
  }

  coinFromRequester(coin: string): Observable<number> {
    return new Observable((sub$) => {
      this.requester.conversion('BRL', coin, (r) => sub$.next(r));
    });
  }
  makeQuotationFromRequester(ticker: string): Observable<number> {
    return new Observable((sub$) => {
      const id = this.requester.subscribeQuotation(ticker, (n) => sub$.next(n));
      return () => {
        this.requester.unsubscribeQuotation(id);
      };
    });
  }
}
