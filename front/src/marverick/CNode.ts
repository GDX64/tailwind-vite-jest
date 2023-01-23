import { computed } from '@maverick-js/signals';

export class CNode {
  children = [] as (() => CNode)[];
  matrix?: () => DOMMatrix;

  constructor(public myDraw?: (ctx: CanvasRenderingContext2D) => void) {}

  addChild(fn: () => CNode) {
    const comp = computed(fn);
    this.children.push(comp);
    return this;
  }

  setTransform(fn: () => DOMMatrix) {
    this.matrix = computed(fn);
    return this;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.matrix) {
      ctx.save();
      const { a, b, c, d, e, f } = this.matrix();
      ctx.transform(a, b, c, d, e, f);
    }
    this.myDraw?.(ctx);
    this.children.forEach((child) => {
      ctx.save();
      child().draw(ctx);
      ctx.restore();
    });
    this.matrix && ctx.restore();
  }
}
