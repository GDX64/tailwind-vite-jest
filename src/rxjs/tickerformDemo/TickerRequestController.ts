import {
  combineLatest,
  map,
  Observable,
  of,
  ReplaySubject,
  share,
  shareReplay,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';
import { ref, Ref } from 'vue';
import { Requester, TickerData } from './interfaces';

export default class TickerRequestController {
  private ticker$ = new Subject<string>();
  private coin$ = new Subject<string>();
  private data$: Observable<TickerData[]>;
  private quotationCache = new Map<string, Observable<number>>();
  constructor(private requester: Requester) {
    const currentCoinConversion$ = this.currentCoinConversion$();
    const arrTickers$ = this.arrTickers$();
    const quotations$ = this.quotationsOf(arrTickers$);
    const convertedQuotation$ = convertQuotations(currentCoinConversion$, quotations$);
    this.data$ = combineTickerAndQuotations(arrTickers$, convertedQuotation$);
  }

  private currentCoinConversion$() {
    return this.coin$.pipe(
      switchMap((coin) => this.coinFromRequester(coin).pipe(startWith(0))),
      shareReplay({ refCount: true, bufferSize: 1 })
    );
  }

  private arrTickers$() {
    return this.ticker$.pipe(
      switchMap((ticker) => {
        return this.tickerFromRequester(ticker).pipe(startWith([] as string[]));
      }),
      share()
    );
  }

  private quotationsOf(arrTickers$: Observable<string[]>): Observable<number[]> {
    return arrTickers$.pipe(
      switchMap((tickersAnswer) => {
        if (tickersAnswer.length === 0) return of([]);
        const quotationsWithName = tickersAnswer.map((ticker) =>
          this.quotationFromRequester(ticker).pipe(startWith(0))
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

  private coinFromRequester(coin: string): Observable<number> {
    return new Observable((sub$) => {
      this.requester.conversion('BRL', coin, (r) => sub$.next(r));
    });
  }

  private quotationFromRequester(ticker: string): Observable<number> {
    if (!this.quotationCache.has(ticker)) {
      const replay = new ReplaySubject<number>(1);
      const quotation$ = this.makeQuotationFromRequester(ticker).pipe(
        share({
          connector: () => replay,
        })
      );
      this.quotationCache.set(ticker, quotation$);
    }
    return this.quotationCache.get(ticker)!;
  }

  private makeQuotationFromRequester(ticker: string): Observable<number> {
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

function convertQuotations(
  currentCoinConversion$: Observable<number>,
  quotations$: Observable<number[]>
) {
  return combineLatest([currentCoinConversion$, quotations$], (factor, quotations) => {
    return quotations.map((quotation) => quotation * factor);
  });
}

function combineTickerAndQuotations(
  arrTickers$: Observable<string[]>,
  quotations$: Observable<number[]>
): Observable<TickerData[]> {
  return combineLatest([arrTickers$, quotations$], (arrTickers, quotations) => {
    return arrTickers.map((item, index) => ({
      name: item,
      price: quotations[index],
    }));
  });
}
