import Rough from 'roughjs';

export enum ChartType {
  GROUP,
  LINE,
  RECT,
}

interface NodeBase<Type extends ChartType = ChartType, Data = any> {
  type: Type;
  data: Data;
  children?: ChartNode[];
  cacheDraw?: any;
}

export type LineNode = NodeBase<
  ChartType.LINE,
  { color: string; points: [number, number][] }
>;
export type RectNode = NodeBase<
  ChartType.RECT,
  { color: string; x: number; y: number; width: number; height: number }
>;
export type GroupNode = NodeBase<ChartType.GROUP, { matrix: DOMMatrix }>;

export type ChartNode = RectNode | LineNode | GroupNode;

export interface Stage {
  canvas: HTMLCanvasElement;
  root: ChartNode;
}

export function renderRough(stage: Stage) {
  const rCanvas = Rough.canvas(stage.canvas);
  const ctx = stage.canvas.getContext('2d')!;
  ctx.clearRect(0, 0, stage.canvas.width, stage.canvas.height);

  function draw(node: ChartNode) {
    if (node.type === ChartType.LINE) {
      rCanvas.linearPath(node.data.points, {
        stroke: node.data.color,
        seed: 1,
      });
    }
    if (node.type === ChartType.RECT) {
      const { width, height, x, y, color } = node.data;
      rCanvas.rectangle(x, y, width, height, { fill: color, seed: 1 });
    }
    if (node.type === ChartType.GROUP && node.children) {
      ctx.save();
      ctx.setTransform(ctx.getTransform().multiply(node.data.matrix));
      node.children.forEach(draw);
      ctx.restore();
      return;
    }
    if (node.children) {
      node.children.forEach(draw);
    }
  }

  draw(stage.root);
}
