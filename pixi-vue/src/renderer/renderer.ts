import { createRenderer, Component } from "vue";
import * as PIXI from "pixi.js";
import { ElTags, GElement, GRect, GText } from "./Elements";
import { LayoutBox, LayoutResult } from "./Layout";

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
  pApp.ticker.add(() => {
    if (nodeRoot.dirtyLayout) {
      updateLayouts(nodeRoot);
    }
  });
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

function calcLayout(el: GElement): LayoutBox<GElement> {
  const box = new LayoutBox(el);
  box.kind = el.position;
  box.x = el.x;
  box.y = el.y;
  box.width = el.width;
  box.height = el.height;
  for (const child of el.children) {
    box.addChild(calcLayout(child));
  }
  return box;
}

function updateLayouts(el: GElement) {
  const box = calcLayout(el);
  const result = box.calculateLayout();
  console.log(result);
  function updateWithResults(result: LayoutResult<GElement>) {
    const el = result.data;
    if (el == null) return;
    el.updateLayout(result);
    for (const child of result.children) {
      updateWithResults(child);
    }
  }
  updateWithResults(result);
}
