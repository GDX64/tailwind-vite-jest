import { RoughCanvas } from 'roughjs/bin/canvas';
import * as LinScale from '../pixijs/chart/Scale';

const candles = genCandleChart([0, 100], 20, 5);
console.log(candles);

export function plot(d: RoughCanvas, canvas: HTMLCanvasElement) {
  const { width, height } = canvas;

  const maxY = Math.max(...candles.map((candle) => candle.max));
  const minY = Math.min(...candles.map((candle) => candle.min));
  const maxX = candles[candles.length - 1].x;
  const minX = candles[0].x;
  const scaleX = new LinScale.Scale(minX, maxX, 0, width);
  const scaleY = new LinScale.Scale(minY, maxY, height, 0);

  const pixels = candlePlot(
    candles,
    { transform: scaleX.transform.bind(scaleX), calcWidth: () => 20 },
    scaleY
  );

  pixels.forEach((pixel) => candleDraw(d, pixel));
}

function candleDraw(d: RoughCanvas, { open, close, min, max, x, width }: PixelCandle) {
  console.log({ open, x, close });
  const top = Math.min(open, close);
  const bottom = Math.max(open, close);
  const fill = close < open ? 'green' : 'red';
  const heigth = Math.abs(close - open);
  const middle = x + width / 2;
  d.line(middle, max, middle, top);
  d.rectangle(x, top, width, heigth, { fill });
  d.line(middle, bottom, middle, min);
}

interface Candle {
  open: number;
  close: number;
  min: number;
  max: number;
  x: number;
}

interface PixelCandle {
  open: number;
  close: number;
  min: number;
  max: number;
  x: number;
  width: number;
}

interface Scale {
  transform(x: number): number;
}

interface ScaleX {
  transform(x: number): number;
  calcWidth(candles: Candle[]): number;
}

function candlePlot(candles: Candle[], scaleX: ScaleX, scaleY: Scale) {
  const width = scaleX.calcWidth(candles);
  const pixels = candles.map((candle) => {
    const candlePixel: PixelCandle = {
      close: scaleY.transform(candle.close),
      open: scaleY.transform(candle.open),
      min: scaleY.transform(candle.min),
      max: scaleY.transform(candle.max),
      x: scaleX.transform(candle.x),
      width,
    };
    return candlePixel;
  });
  return pixels;
}

function genCandleChart(
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
