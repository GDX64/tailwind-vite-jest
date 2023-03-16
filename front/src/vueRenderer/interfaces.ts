export enum ChartType {
  GROUP = 'group',
  LINE = 'line',
  RECT = 'rect',
  SCALE = 'scale',
  TEXT = 'text',
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
}

export type LineNode = NodeBase<
  ChartType.LINE,
  { color: string; points: [number, number][] }
>;

export type TextNode = NodeBase<ChartType.TEXT, { color: string; text: string }>;

export type ScaleNode = NodeBase<
  ChartType.SCALE,
  {
    y: { domain: [number, number]; image: [number, number] };
    x: { domain: [number, number]; image: [number, number] };
  }
>;

export type RectNode = NodeBase<
  ChartType.RECT,
  { color: string; x: number; y: number; width: number; height: number }
>;

export type GroupNode = NodeBase<ChartType.GROUP, { matrix: DOMMatrix }>;

export type ChartNode = RectNode | LineNode | GroupNode | ScaleNode | TextNode;

export interface Stage {
  canvas: HTMLCanvasElement;
  root: ChartNode;
}
