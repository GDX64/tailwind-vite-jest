import { Candle } from './interfaces';

export function genCandleChart(
  range: [number, number],
  amount: number,
  variance: number
): Candle[] {
  const randomInt = (min: number, max: number) =>
    Math.round(Math.random() * (max - min)) + min;
  const open = randomInt(range[0], range[1]);
  const close = randomInt(open - variance, open + variance);
  const arr: Candle[] = [
    {
      close,
      open,
      min: randomInt(Math.min(open, close) - variance, Math.min(open, close)),
      max: randomInt(Math.max(open, close), Math.max(open, close) + variance),
      x: 0,
    },
  ];
  for (let i = 1; i < amount; i++) {
    const open = arr[i - 1].close;
    const close = randomInt(open - variance, open + variance);
    arr.push({
      open,
      close,
      min: randomInt(Math.min(open, close) - variance / 2, Math.min(open, close)),
      max: randomInt(Math.max(open, close), Math.max(open, close) + variance / 2),
      x: i,
    });
  }
  return arr;
}

export function mergeCandles(candles: Candle[], maxValue: number) {
  const agregationFactor = Math.floor(candles.length / maxValue);
  if (agregationFactor <= 1) return candles;
  const agregated = [] as Candle[];
  let i = 0;
  while (i * agregationFactor < candles.length) {
    const slice = candles.slice(i, i + agregationFactor);
    const { open, close, min, max } = mergeCandle(slice);
    agregated.push({ open, close, min, max, x: i });
    i++;
  }
  return agregated;
}

function mergeCandle(candles: Candle[]) {
  const open = candles[0].open;
  const close = candles[candles.length - 1].close;
  const max = Math.max(...candles.map((candle) => candle.max));
  const min = Math.min(...candles.map((candle) => candle.min));
  return { open, close, max, min };
}
