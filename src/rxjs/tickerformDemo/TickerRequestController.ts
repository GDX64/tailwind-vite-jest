import {
  combineLatest,
  Observable,
  of,
  ReplaySubject,
  share,
  shareReplay,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';
import { TickerData } from './interfaces';
import RequesterToObs from './RequesterToObs';

export default class TickerRequestController {
  private quotationCache = new Map<string, Observable<number>>();
  constructor(private requester: RequesterToObs) {}

  data$(ticker$: Subject<string>, coin$: Subject<string>) {
    const currentCoinConversion$ = this.currentCoinConversion$(coin$);
    const arrTickers$ = this.arrTickers$(ticker$);
    const quotations$ = this.quotationsOf(arrTickers$);
    const convertedQuotation$ = convertQuotations(currentCoinConversion$, quotations$);
    return combineTickerAndQuotations(arrTickers$, convertedQuotation$);
  }

  private currentCoinConversion$(coin$: Observable<string>) {
    return coin$.pipe(
      switchMap((coin) => this.requester.coinFromRequester(coin).pipe(startWith(0))),
      shareReplay({ refCount: true, bufferSize: 1 })
    );
  }

  private arrTickers$(ticker$: Observable<string>) {
    return ticker$.pipe(
      switchMap((ticker) => {
        return this.requester.tickerFromRequester(ticker).pipe(startWith([] as string[]));
      }),
      shareReplay({ refCount: true, bufferSize: 1 })
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

  private quotationFromRequester(ticker: string): Observable<number> {
    if (!this.quotationCache.has(ticker)) {
      const replay = new ReplaySubject<number>(1);
      const quotation$ = this.requester
        .makeQuotationFromRequester(ticker)
        .pipe(share({ connector: () => replay }));
      this.quotationCache.set(ticker, quotation$);
    }
    return this.quotationCache.get(ticker)!;
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
