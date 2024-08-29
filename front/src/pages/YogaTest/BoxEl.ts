import Yoga, { Node } from 'yoga-layout';

export class BoxEl {
  layout: Node = Yoga.Node.create();
  children: BoxEl[] = [];
  parent?: BoxEl = undefined;
  render?: (ctx: CanvasRenderingContext2D) => void = undefined;

  constructor(public id?: string) {}

  left() {
    return this.layout.getComputedLeft();
  }

  top() {
    return this.layout.getComputedTop();
  }

  width() {
    return this.layout.getComputedWidth();
  }

  height() {
    return this.layout.getComputedHeight();
  }

  insertChild(box: BoxEl) {
    this.children.push(box);
    this.layout.insertChild(box.layout, this.children.length - 1);
    box.parent = this;
  }

  withChildren(fn: () => BoxEl[]) {
    fn().forEach((child) => this.insertChild(child));
    return this;
  }

  hitTest(x: number, y: number): BoxEl[] {
    const left = this.layout.getComputedLeft();
    const top = this.layout.getComputedTop();
    const right = left + this.layout.getComputedWidth();
    const bottom = top + this.layout.getComputedHeight();
    const result: BoxEl[] = [];
    if (x >= left && x <= right && y >= top && y <= bottom) {
      result.push(this);
    }
    this.children.forEach((child) => {
      result.push(...child.hitTest(x - left, y - top));
    });
    return result;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.layout.getComputedLeft(), this.layout.getComputedTop());
    this.render?.(ctx);
    this.children.forEach((child) => child.draw(ctx));
    ctx.restore();
  }
}
