export interface Candle {
  open: number;
  close: number;
  min: number;
  max: number;
  x: number;
}

export interface PixelCandle {
  open: number;
  close: number;
  min: number;
  max: number;
  x: number;
  width: number;
}

export interface Scale {
  transform(x: number): number;
}

export interface ScaleX {
  transform(x: number): number;
  calcWidth(candles: Candle[]): number;
}
