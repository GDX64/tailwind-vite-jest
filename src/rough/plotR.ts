import { RoughCanvas } from 'roughjs/bin/canvas';
import * as LinScale from '../pixijs/chart/Scale';
import { mergeCandles } from './helpers';
import { Candle, PixelCandle, Scale, ScaleX } from './interfaces';

const minGap = 10;

export function plot(
  canvasData: CanvasData,
  allCandles: Candle[],
  range: [number, number]
) {
  const { width, height } = canvasData.canvas;
  canvasData.canvas.width = width;
  const candles = mergeCandles(allCandles.slice(...range), 50);
  const maxY = Math.max(...candles.map((candle) => candle.max));
  const minY = Math.min(...candles.map((candle) => candle.min));
  const maxX = candles[candles.length - 1]?.x ?? 0;
  const minX = candles[0]?.x ?? 0;
  const scaleX = new LinScale.Scale(minX - 0.5, maxX + 0.5, 0, width);
  const scaleY = new LinScale.Scale(minY, maxY, height, 0);

  const candleWidth = Math.max(Math.round(width / candles.length) - minGap, 0);

  const pixels = candlePlot(
    candles,
    { transform: scaleX.transform.bind(scaleX), calcWidth: () => candleWidth },
    scaleY
  );

  pixels.forEach((pixel) => candleDraw(canvasData.d, pixel));
}

function candleDraw(d: RoughCanvas, { open, close, min, max, x, width }: PixelCandle) {
  const top = Math.min(open, close);
  const bottom = Math.max(open, close);
  const fill = close < open ? 'green' : 'red';
  const heigth = Math.abs(close - open);
  const minX = x - width / 2;
  d.line(x, max, x, top);
  d.rectangle(minX, top, width, heigth, { fill });
  d.line(x, bottom, x, min);
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

interface CanvasData {
  d: RoughCanvas;
  canvas: HTMLCanvasElement;
}
