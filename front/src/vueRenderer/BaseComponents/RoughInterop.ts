import { Graphics } from 'pixi.js';
import { Op } from 'roughjs/bin/core';
import { Drawable } from 'roughjs/bin/core';
import Rough from 'roughjs';

export const rgen = Rough.generator();

export function toPixiGraphic(d: Drawable, g: Graphics, fillOpacity = 1) {
  d.sets.forEach((set) => {
    if (set.type === 'path' || set.type === 'fillSketch') {
      if (set.type === 'fillSketch') {
        g.lineStyle(d.options.fillWeight, d.options.fill);
      } else {
        g.lineStyle(d.options.strokeWidth, d.options.stroke);
      }
      set.ops.forEach(operationOnGraphics);
    } else {
      g.beginFill(d.options.fill, fillOpacity);
      set.ops.forEach(operationOnGraphics);
      g.endFill();
    }
  });

  function operationOnGraphics(op: Op) {
    if (op.op === 'bcurveTo') {
      g.bezierCurveTo(...(op.data as [number, number, number, number, number, number]));
    } else if (op.op === 'lineTo') {
      g.lineTo(op.data[0], op.data[1]);
    } else if (op.op === 'move') {
      g.moveTo(op.data[0], op.data[1]);
    }
  }
}
