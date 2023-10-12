import { createRenderer, Component } from "vue";
import * as PIXI from "pixi.js";

export enum ElTags {
  TEXT = "g-text",
  RECT = "g-rect",
}

class GElement {
  pixiRef: PIXI.Container = new PIXI.Container();
  parent: null | GElement = null;
  children: GElement[] = [];

  static text(str: string) {
    return new GText(str);
  }

  patch(prop: string, prev: any, next: any) {}

  addChild(child: GElement) {
    child.parent = this;
    this.children.push(child);
    this.pixiRef.addChild(child.pixiRef);
  }

  setText(str: string) {}

  addChildAt(child: GElement, index: number) {
    child.parent = this;
    this.children.splice(index, 0, child);
    this.pixiRef.addChildAt(child.pixiRef, index);
  }

  removeChild(child: GElement) {
    const index = this.children.findIndex((item) => item === child);
    if (index === -1) return;
    this.children.splice(index, 1);
    this.pixiRef.removeChild(child.pixiRef);
  }
}

function appRenderer() {
  const { createApp } = createRenderer<GElement, GElement>({
    createComment(text) {
      return GElement.text(text);
    },
    createElement(type, isSVG, isCustomizedBuiltIn, vnodeProps) {
      switch (type) {
        case ElTags.RECT:
          return new GRect();
        case ElTags.TEXT:
          return new GText("");
        default:
          return new GElement();
      }
    },
    createText(text) {
      return GElement.text(text);
    },
    insert(el, parent, anchor) {
      const index = parent.children.findIndex((item) => item === anchor);
      if (index === -1) {
        parent.addChild(el);
      } else {
        parent.addChildAt(el, index + 1);
      }
    },
    nextSibling(node) {
      const index = node.parent?.children.findIndex((item) => item === node);
      if (index === -1 || index == null) return null;
      return node.parent?.children[index + 1] ?? null;
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
      el.patch(key, prevValue, nextValue);
    },
    remove(el) {
      el.parent?.removeChild(el);
    },
    setElementText(node, text) {
      node.setText(text);
    },
    setText(node, text) {
      node.setText(text);
    },
  });
  return { createApp };
}

export async function createRoot(canvas: HTMLCanvasElement, comp: Component) {
  const pApp = new PIXI.Application();
  await pApp.init({
    canvas,
    backgroundColor: 0xffffff,
    resolution: devicePixelRatio,
    resizeTo: canvas,
  });
  const app = appRenderer().createApp(comp);
  const nodeRoot = new GElement();
  nodeRoot.pixiRef = pApp.stage;
  app.mount(nodeRoot);
  return {
    destroy: () => {
      app.unmount();
      pApp.destroy();
    },
    pApp,
  };
}

class GRect extends GElement {
  width = 0;
  height = 0;
  fill = 0xffffff;
  pixiRef: PIXI.Graphics = new PIXI.Graphics();
  isDirty = false;

  markDirty() {
    if (!this.isDirty) {
      this.isDirty = true;
      queueMicrotask(() => {
        this.redraw();
        this.isDirty = false;
      });
    }
  }

  redraw() {
    this.pixiRef.clear();
    const rect = this.pixiRef.rect(0, 0, this.width, this.height);
    rect.fillStyle = this.fill;
    rect.fill();
    console.log("redraw");
  }

  patch(prop: string, prev: any, next: any) {
    console.log(prop, prev, next);
    switch (prop) {
      case "onClick":
        this.pixiRef.interactive = true;
        this.pixiRef.on("click", next);
        break;
      case "width":
        this.width = next;
        this.markDirty();
        break;
      case "height":
        this.height = next;
        this.markDirty();
        break;
      case "x":
        this.pixiRef.x = next;
        break;
      case "y":
        this.pixiRef.y = next;
        break;
      case "fill":
        this.fill = next;
        this.markDirty();
        break;
      default:
        break;
    }
  }
}

class GText extends GElement {
  pixiRef: PIXI.Text = new PIXI.Text({});
  constructor(str: string) {
    super();
    this.pixiRef.text = str;
  }

  setText(str: string) {
    this.pixiRef.text = str;
  }

  patch(prop: string, prev: any, next: any) {
    switch (prop) {
      case "x":
        this.pixiRef.x = next;
        break;
      case "y":
        this.pixiRef.y = next;
        break;
      case "fontSize":
        this.pixiRef.style.fontSize = next;
        break;
      default:
        break;
    }
  }
}
