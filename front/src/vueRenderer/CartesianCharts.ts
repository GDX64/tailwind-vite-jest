import Rough from 'roughjs';
import * as d3 from 'd3';
export * from './interfaces';
import { BasicDrawOptions, ChartNode, ChartType, Drawer, Stage } from './interfaces';

export function renderRough(stage: Stage) {
  const drawer = new RoughDrawer(stage.canvas);
  const ctx = stage.canvas.getContext('2d')!;
  ctx.clearRect(0, 0, stage.canvas.width, stage.canvas.height);

  function draw(node: ChartNode, scale: ScalePair) {
    if (node.type === ChartType.LINE && node.data.points.length >= 2) {
      node.path = drawer.curve(
        node.data.points.map((points) => [scale.x(points[0]), scale.y(points[1])]),
        {
          ...node.data,
          seed: 1,
        }
      );
    }
    if (node.type === ChartType.RECT) {
      const { width, height, x, y } = node.data;
      const finalX = scale.x(x);
      const finalY = scale.y(y);
      const finalWidth = scaleAlpha(scale.x) * width;
      const finalHeight = scaleAlpha(scale.y) * height;
      node.path = drawer.rect(finalX, finalY, finalWidth, finalHeight, {
        ...node.data,
        seed: 1,
      });
      return;
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
        drawer.line(x(initX), y(0), x(finalX), y(0), { seed: 1, ...node.data });
        drawer.line(x(0), y(initY), x(0), y(finalY), { seed: 1, ...node.data });
        x.ticks(5).forEach((num) => {
          drawer.line(x(num), y(0) - 3, x(num), y(0) + 3, { seed: 1 });
        });
        y.ticks(5).forEach((num) => {
          drawer.line(x(0) + 3, y(num), x(0) - 3, y(num), { seed: 1 });
        });
      }
      node.children?.forEach((shape) => draw(shape, { x, y }));
      return;
    }
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

class RoughDrawer implements Drawer {
  rCanvas;
  constructor(canvas: HTMLCanvasElement) {
    this.rCanvas = Rough.canvas(canvas);
  }

  line(
    x: number,
    y: number,
    x2: number,
    y2: number,
    options?: BasicDrawOptions | undefined
  ): Path2D {
    this.rCanvas.line(x, y, x2, y2, options);
    return new Path2D();
  }

  rect(
    x: number,
    y: number,
    width: number,
    height: number,
    options?: BasicDrawOptions | undefined
  ): Path2D {
    this.rCanvas.rectangle(x, y, width, height, options);
    console.log(x);
    const path = new Path2D();
    path.rect(x, y, width, height);
    return path;
  }

  curve(points: [number, number][], options?: BasicDrawOptions | undefined): Path2D {
    this.rCanvas.curve(points, options);
    return new Path2D();
  }
}
