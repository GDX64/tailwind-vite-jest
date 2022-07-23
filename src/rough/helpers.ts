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
      min: randomInt(Math.min(open, close) - variance, Math.min(open, close)),
      max: randomInt(Math.max(open, close), Math.max(open, close) + variance),
      x: i,
    });
  }
  return arr;
}
