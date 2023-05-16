import { Options } from 'roughjs/bin/core';

export enum ChartType {
  GROUP = 'group',
  LINE = 'gline',
  RECT = 'rect',
  SCALE = 'scale',
  TEXT = 'text',
}

export enum PIXIEL {
  CONTAINER = 'pcontainer',
  GRAPHICS = 'pgraphics',
  TEXT = 'ptext',
}

interface NodeBase<
  Type extends ChartType = ChartType,
  Data extends Record<string, any> = Record<string, any>
> {
  type: Type;
  data: Data;
  events: {
    onClick?: () => void;
  };
  parent?: ChartNode;
  children?: ChartNode[];
  cacheDraw?: any;
  path?: Path2D;
}

export type LineNode = NodeBase<
  ChartType.LINE,
  { points: [number, number][] } & BasicDrawOptions
>;

export type TextNode = NodeBase<ChartType.TEXT, { text: string } & BasicDrawOptions>;

export type ScaleNode = NodeBase<
  ChartType.SCALE,
  {
    y: { domain: [number, number]; image: [number, number] };
    x: { domain: [number, number]; image: [number, number] };
  } & BasicDrawOptions
>;

export type RectNode = NodeBase<
  ChartType.RECT,
  { x: number; y: number; width: number; height: number } & BasicDrawOptions
>;

export type GroupNode = NodeBase<ChartType.GROUP, { matrix: DOMMatrix }>;

export type ChartNode = RectNode | LineNode | GroupNode | ScaleNode | TextNode;

export interface Stage {
  canvas: HTMLCanvasElement;
  root: ChartNode;
}

export type BasicDrawOptions = Options;

export interface Drawer {
  line(x: number, y: number, x2: number, y2: number, options?: BasicDrawOptions): Path2D;
  rect(
    x: number,
    y: number,
    width: number,
    height: number,
    options?: BasicDrawOptions
  ): Path2D;
  curve(points: [number, number][], options?: BasicDrawOptions): Path2D;
}

export interface ScaleXY {
  x(n: number): number;
  y(n: number): number;
  alphaX: number;
  alphaY: number;
}
