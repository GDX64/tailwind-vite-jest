import Rough from 'roughjs';
import * as d3 from 'd3';
export * from './interfaces';
import { ChartNode, ChartType, Stage } from './interfaces';

export interface Geometry {
  path?: Path2D;
  children: Geometry[];
  events?: Record<string, Function>;
}

export function renderRough(stage: Stage) {
  const rCanvas = Rough.canvas(stage.canvas);
  const ctx = stage.canvas.getContext('2d')!;
  ctx.clearRect(0, 0, stage.canvas.width, stage.canvas.height);

  function draw(node: ChartNode, scale: ScalePair): Geometry {
    if (node.type === ChartType.LINE) {
      rCanvas.curve(
        node.data.points.map((points) => [scale.x(points[0]), scale.y(points[1])]),
        {
          stroke: node.data.color,
          seed: 1,
        }
      );
    }
    if (node.type === ChartType.RECT) {
      const { width, height, x, y, color } = node.data;
      const finalX = scale.x(x);
      const finalY = scale.y(y);
      const finalWidth = scaleAlpha(scale.x) * width;
      const finalHeight = scaleAlpha(scale.y) * height;
      rCanvas.rectangle(finalX, finalY, finalWidth, finalHeight, {
        stroke: color,
        seed: 1,
      });
      const path = new Path2D();
      path.rect(finalX, finalY, finalWidth, finalHeight);
      return { path, events: node.events, children: [] };
    }
    if (node.type === ChartType.GROUP && node.children) {
      ctx.save();
      ctx.setTransform(ctx.getTransform().multiply(node.data.matrix));
      const children = node.children.map((shape) => draw(shape, scale));
      ctx.restore();
      return { children };
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
    return { children: [] };
  }

  const identity = d3.scaleLinear();
  return draw(stage.root, { x: identity, y: identity });
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
