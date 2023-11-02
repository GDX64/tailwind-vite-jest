import { createRenderer, Component, provide, inject, onUnmounted } from "vue";
import * as PIXI from "pixi.js";
import { ElTags, GElement, GRect, GText } from "./Elements";

declare module "vue" {
  export interface GlobalComponents {
    GText: Component<{ x: number; y: number; text: string }>;
    GRect: Component<{ x: number; y: number }>;
    GContainer: Component<{ x: number; y: number }>;
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
        case ElTags.CONTAINER:
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
      const index = node.parent
        ?.deref()
        ?.children.findIndex((item) => item === node);
      if (index === -1 || index == null) return null;
      return node.parent?.deref()?.children[index + 1] ?? null;
    },
    parentNode(node) {
      return node.parent?.deref() ?? null;
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
      el.parent?.deref()?.removeChild(el);
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
    canvas: canvas,
    backgroundColor: 0xffffff,
    resolution: devicePixelRatio,
    resizeTo: canvas,
    antialias: true,
  });
  const app = appRenderer().createApp(comp);
  app.provide("pixiApp", pApp);
  const nodeRoot = new GElement();
  pApp.ticker.add(
    () => {
      if (nodeRoot.isDirty) {
        nodeRoot.redraw();
      }
    },
    null,
    PIXI.UPDATE_PRIORITY.INTERACTION
  );
  nodeRoot.pixiRef = pApp.stage;
  app.mount(nodeRoot);

  return {
    destroy: () => {
      app.unmount();
      pApp.stop();
      pApp.renderer.destroy();
    },
    pApp,
  };
}

export function usePixiApp() {
  return inject<PIXI.Application>("pixiApp")!;
}

export function usePixiAnimation(fn: (ticker: PIXI.Ticker) => void) {
  const app = usePixiApp();
  app.ticker.add(fn);
  onUnmounted(() => {
    app.ticker.remove(fn);
  });
}
