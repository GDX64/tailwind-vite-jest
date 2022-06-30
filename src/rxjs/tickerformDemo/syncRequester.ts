import { combineLatest, Observable, share, shareReplay, switchMap } from 'rxjs';
import { TickerData } from './interfaces';

interface SyncRequester {
  tickersOf(ticker: string): string[];
  coinConversion(coin: string): number;
  quotationOf(ticker: string): number;
}

interface AsyncRequester {
  tickersOf(ticker: string): Promise<string[]>;
  coinConversion(coin: string): Promise<number>;
  quotationOf(ticker: string): Promise<number>;
}

interface StreamRequester {
  tickersOf(ticker: string): Observable<string[]>;
  coinConversion(coin: string): Observable<number>;
  quotationOf(ticker: string): Observable<number>;
}

function makeRequest(
  ticker: string,
  coin: string,
  requester: SyncRequester
): TickerData[] {
  const tickers = requester.tickersOf(ticker);
  const quotations = tickers.map((ticker) => requester.quotationOf(ticker));
  const conversion = requester.coinConversion(coin);
  const convertedQuotations = quotations.map((quotation) => quotation * conversion);
  return tickers.map((ticker, index) => ({
    name: ticker,
    price: convertedQuotations[index],
  }));
}

function makeAsyncRequest(
  ticker: Promise<string>,
  coin: Promise<string>,
  requester: AsyncRequester
): Promise<TickerData[]> {
  const tickers = ticker.then((ticker) => requester.tickersOf(ticker));
  const quotations = tickers.then((tickers) => {
    const quotationPromises = tickers.map((ticker) => requester.quotationOf(ticker));
    return Promise.all(quotationPromises);
  });
  const conversion = coin.then((coin) => requester.coinConversion(coin));
  const convertedQuotations = Promise.all([quotations, conversion]).then(
    ([quotations, conversion]) => {
      return quotations.map((quotation) => quotation * conversion);
    }
  );
  return Promise.all([tickers, convertedQuotations]).then(
    ([tickers, convertedQuotations]) => {
      return tickers.map((ticker, index) => ({
        name: ticker,
        price: convertedQuotations[index],
      }));
    }
  );
}

function ultimateAsyncRequest(
  ticker: Observable<string>,
  coin: Observable<string>,
  requester: StreamRequester
): Observable<TickerData[]> {
  const tickers$ = ticker.pipe(
    switchMap((ticker) => requester.tickersOf(ticker)),
    shareReplay(1)
  );
  const quotations$ = getQuotations$(tickers$, requester);
  const conversion$ = coin.pipe(switchMap((coin) => requester.coinConversion(coin)));
  const tickerData$ = combineTickerData$(tickers$, quotations$, conversion$);
  return tickerData$;
}
function combineTickerData$(
  tickers$: Observable<string[]>,
  quotations$: Observable<number[]>,
  conversion$: Observable<number>
) {
  return combineLatest(
    [tickers$, quotations$, conversion$],
    (tickers, quotations, conversion) => {
      return tickers.map((ticker, index) => ({
        name: ticker,
        price: quotations[index] * conversion,
      }));
    }
  );
}

function getQuotations$(tickers$: Observable<string[]>, requester: StreamRequester) {
  return tickers$.pipe(
    switchMap((tickers) => {
      const quotations$ = combineLatest(
        tickers.map((ticker) => requester.quotationOf(ticker))
      );
      return quotations$;
    })
  );
}
