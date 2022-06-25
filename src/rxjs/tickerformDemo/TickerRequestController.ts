import { combineLatest, map, Observable, Subject, switchMap } from 'rxjs';
import { ref, Ref } from 'vue';
import { Requester, TickerData } from './interfaces';

export default class TickerRequestController {
  private ticker$ = new Subject<string>();
  private coin$ = new Subject<string>();
  private data$: Observable<TickerData[]>;
  constructor(private requester: Requester) {
    this.data$ = this.ticker$.pipe(
      switchMap((ticker) => {
        console.log('made request');
        return this.tickerFromRequester(ticker);
      }),
      switchMap((tickersAnswer) => {
        const quotationsWithName = tickersAnswer.map((ticker) =>
          this.quotationFromRequester(ticker).pipe(
            map((value) => {
              return { name: ticker, price: value };
            })
          )
        );
        return combineLatest(quotationsWithName);
      })
    );
  }

  private tickerFromRequester(ticker: string): Observable<string[]> {
    return new Observable((sub$) => {
      this.requester.requestTicker(
        ticker,
        (r) => sub$.next(r),
        (err) => sub$.error(err)
      );
    });
  }

  private quotationFromRequester(ticker: string): Observable<number> {
    return new Observable((sub$) => {
      const id = this.requester.subscribeQuotation(ticker, (n) => sub$.next(n));
      return () => {
        this.requester.unsubscribeQuotation(id);
      };
    });
  }

  ticker(input: string) {
    this.ticker$.next(input);
  }

  coin(input: string) {
    this.coin$.next(input);
  }

  getReference(): Ref<TickerData[]> {
    const dataRef = ref([] as TickerData[]);
    this.data$.subscribe((data) => {
      dataRef.value = data;
    });
    return dataRef;
  }
}
