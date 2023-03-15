import Rough from 'roughjs';
import * as d3 from 'd3';
export enum ChartType {
  GROUP,
  LINE,
  RECT,
  SCALE,
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

export type ChartNode = RectNode | LineNode | GroupNode | ScaleNode;

export interface Stage {
  canvas: HTMLCanvasElement;
  root: ChartNode;
}

export function renderRough(stage: Stage) {
  const rCanvas = Rough.canvas(stage.canvas);
  const ctx = stage.canvas.getContext('2d')!;
  ctx.clearRect(0, 0, stage.canvas.width, stage.canvas.height);

  function draw(node: ChartNode, scale: ScalePair) {
    if (node.type === ChartType.LINE) {
      const d = rCanvas.curve(
        node.data.points.map((points) => [scale.x(points[0]), scale.y(points[1])]),
        {
          stroke: node.data.color,
          seed: 1,
        }
      );
      console.log(d);
    }
    if (node.type === ChartType.RECT) {
      const { width, height, x, y, color } = node.data;
      rCanvas.rectangle(
        scale.x(x),
        scale.y(y),
        scaleAlpha(scale.x) * width,
        scaleAlpha(scale.y) * height,
        {
          fill: color,
          seed: 1,
        }
      );
    }
    if (node.type === ChartType.GROUP && node.children) {
      ctx.save();
      ctx.setTransform(ctx.getTransform().multiply(node.data.matrix));
      node.children.forEach((shape) => draw(shape, scale));
      ctx.restore();
      return;
    }
    if (node.type === ChartType.SCALE) {
      const x = d3.scaleLinear(node.data.x.domain, node.data.x.image);
      const y = d3.scaleLinear(node.data.y.domain, node.data.y.image);
      {
        const [initX, finalX] = node.data.x.domain;
        const [initY, finalY] = node.data.y.domain;
        rCanvas.line(x(initX), y(0), x(finalX), y(0), { seed: 1 });
        rCanvas.line(x(0), y(initY), x(0), y(finalY), { seed: 1 });
        x.ticks(5).forEach((num) => {
          rCanvas.line(x(num), y(0) - 3, x(num), y(0) + 3, { seed: 1 });
        });
        y.ticks(5).forEach((num) => {
          rCanvas.line(x(0) + 3, y(num), x(0) - 3, y(num), { seed: 1 });
        });
      }
      node.children?.forEach((shape) => draw(shape, { x, y }));
    }
    if (node.children) {
      node.children.forEach((shape) => draw(shape, scale));
    }
  }

  const identity = d3.scaleLinear();
  draw(stage.root, { x: identity, y: identity });
}

interface ScalePair {
  x: d3.ScaleLinear<number, number>;
  y: d3.ScaleLinear<number, number>;
}

function scaleAlpha(s: d3.ScaleLinear<number, number>) {
  const [d1, d2] = s.domain();
  const [i1, i2] = s.range();
  return (i2 - i1) / (d2 - d1);
}
