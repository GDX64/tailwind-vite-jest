export interface TickerData {
  name: string;
  price: string;
}

export interface Requester {
  requestTicker(
    ticker: string,
    response: (r: string[]) => void,
    error: (err: Error) => void
  ): void;

  subscribeQuotation(ticker: string, response: (n: number) => void): number;

  unsubscribeQuotation(id: number, asset: string): void;

  conversion(from: string, to: string, response: (n: number) => void): void;
}
