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

  worldLeft(): number {
    const parentLeft = this.parent?.worldLeft() ?? 0;
    return this.left() + parentLeft;
  }

  worldTop(): number {
    const parentTop = this.parent?.worldTop() ?? 0;
    return this.top() + parentTop;
  }

  calculateLayout() {
    if (this.layout.isDirty()) {
      this.layout.calculateLayout('auto', 'auto');
    }
  }

  insertChild(box: BoxEl) {
    this.children.push(box);
    this.layout.insertChild(box.layout, this.children.length - 1);
    box.parent = this;
  }

  hitTest(x: number, y: number): BoxEl[] {
    const { left, top, width, height } = this.layout.getComputedLayout();
    const right = left + width;
    const bottom = top + height;
    const result: BoxEl[] = [];
    if (x >= left && x <= right && y >= top && y <= bottom) {
      result.push(this);
      this.children.forEach((child) => {
        result.push(...child.hitTest(x - left, y - top));
      });
    }
    return result;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const isDisplayNone = this.layout.getDisplay() === Yoga.DISPLAY_NONE;
    if (isDisplayNone) {
      return;
    }
    ctx.save();
    ctx.translate(this.layout.getComputedLeft(), this.layout.getComputedTop());
    this.render?.(ctx);
    this.children.forEach((child) => child.draw(ctx));
    ctx.restore();
  }
}
