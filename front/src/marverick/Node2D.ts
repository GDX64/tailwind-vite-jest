import { createRenderer } from 'vue';

interface Node2D {
  draw(ctx: CanvasRenderingContext2D): void;
  parent: Node2D | null;
  text: string | null;
  children: Node2D[];
  redraw(): void;
  patch(key: string, value: any): void;
}

export class NodeContainer implements Node2D {
  parent = null as Node2D | null;
  children: Node2D[] = [];
  text: string | null = '';
  matrix = new DOMMatrix();
  needsRedraw = false;
  draw(ctx: CanvasRenderingContext2D): void {
    this.needsRedraw = false;
    this.children.forEach((child) => {
      const { a, b, c, d, e, f } = this.matrix;
      ctx.save();
      ctx.transform(a, b, c, d, e, f);
      ctx.save();
      child.draw(ctx);
      ctx.restore();
      ctx.restore();
    });
  }

  redraw() {
    // console.log('ask redraw');
    if (this.parent) {
      return this.parent.redraw();
    }
    this.needsRedraw = true;
  }

  patch(key: string, value: any) {
    // console.log(key, value);
    (this as any)[key] = value;
  }
}

export class TextNode extends NodeContainer {
  color = '#000000';
  fontSize = 10;
  constructor(public text: string) {
    super();
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // console.log('draw text');
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.font = this.fontSize + 'px Arial';
    ctx.fillText(this.text, 0, 0);
    // ctx.fillRect(0, 0, 500, 500);
  }
}

export const { createApp, render } = createRenderer<Node2D, Node2D>({
  createComment(text) {
    return new NodeContainer();
  },
  createElement(type, isSVG, isCustomizedBuiltIn, vnodeProps) {
    // console.log('create', type);
    if (type === 'txt') {
      return new TextNode('');
    }
    return new NodeContainer();
  },
  createText(text) {
    // console.log('create text');
    return new TextNode(text);
  },
  insert(el, parent, anchor) {
    el.parent = parent;
    el.redraw();
    parent.children.push(el);
  },
  nextSibling(node) {
    return null;
  },
  parentNode(node) {
    return node?.parent ?? null;
  },
  patchProp(
    el,
    key,
    prevValue,
    nextValue,
    isSVG,
    prevChildren,
    parentComponent,
    parentSuspense,
    unmountChildren
  ) {
    el.patch(key, nextValue);
    el?.redraw();
  },
  remove(el) {
    if (el.parent) {
      el.parent.children = el.parent.children.filter((item) => item !== el);
    }
  },
  setElementText(node, text) {
    node.text = text;
  },
  setText(node, text) {
    node.text = text;
  },
});
