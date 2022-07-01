import { combineLatest, map, Observable, shareReplay, startWith, switchMap } from 'rxjs';
import { TickerData } from './interfaces';
import RequesterToObs from './RequesterToObs';

export function tickerDataOf(
  ticker$: Observable<string>,
  coin$: Observable<string>,
  requester: RequesterToObs
): Observable<TickerData[]> {
  const tickers$ = ticker$.pipe(
    switchMap((ticker) => requester.tickersOf(ticker).pipe(startWith([] as string[]))),
    shareReplay(1)
  );
  const quotations$ = getQuotations$(tickers$, requester);
  const conversion$ = coin$.pipe(
    switchMap((coin) => {
      return requester
        .coinConversion(coin)
        .pipe(map((conversion) => [conversion, coin] as [number, string]));
    })
  );
  const tickerData$ = combineTickerData$(tickers$, quotations$, conversion$);
  return tickerData$;
}
function combineTickerData$(
  tickers$: Observable<string[]>,
  quotations$: Observable<number[]>,
  conversion$: Observable<[number, string]>
) {
  return combineLatest(
    [tickers$, quotations$, conversion$],
    (tickers, quotations, [conversion, coin]) => {
      return tickers.map((ticker, index) => ({
        name: ticker,
        price: `${(quotations[index] * conversion).toFixed(2)} (${coin})`,
      }));
    }
  );
}

function getQuotations$(tickers$: Observable<string[]>, requester: RequesterToObs) {
  return tickers$.pipe(
    switchMap((tickers) => {
      const quotations$ = combineLatest(
        tickers.map((ticker) => requester.quotationOf(ticker).pipe(startWith(0)))
      );
      return quotations$;
    })
  );
}
