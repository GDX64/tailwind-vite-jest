import {
  createRenderer,
  Component,
  provide,
  inject,
  onUnmounted,
  reactive,
  h,
} from "vue";
import * as PIXI from "pixi.js";
import { ElTags, GElement, GRect, GText } from "./Elements";
import RawContainer from "./RawContainer";
import GSprite from "./GSprite";

declare module "vue" {
  type BasicArgs = {
    x: number;
    y: number;
    blendMode: PIXI.BLEND_MODES;
    scale: number;
  };
  export interface GlobalComponents {
    GText: Component<BasicArgs & { text: string }>;
    GRect: Component<BasicArgs & {}>;
    GContainer: Component<BasicArgs & {}>;
    GRaw: Component<BasicArgs & { pixiEl: PIXI.Container }>;
    GSprite: Component<BasicArgs & { url: string }>;
  }
}

function appRenderer() {
  const { createApp } = createRenderer<GElement, GElement>({
    createComment(text) {
      return GElement.text("");
    },
    createElement(type, isSVG, isCustomizedBuiltIn, vnodeProps) {
      switch (type) {
        case ElTags.RECT:
          return new GRect();
        case ElTags.TEXT:
          return new GText("");
        case ElTags.RAW:
          return new RawContainer();
        case ElTags.SPRITE:
          return new GSprite();
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
        ?.children.findIndex((item: any) => item === node);
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
      el.destroy();
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
    resolution: devicePixelRatio,
    resizeTo: canvas,
    antialias: true,
    // backgroundAlpha: 0,
    background: "#00000000",
    clearBeforeRender: true,
    powerPreference: "low-power",
  });

  const appData = reactive({ width: 0, height: 0 });
  const app = appRenderer().createApp(() => h(comp));
  app.provide("pixiApp", pApp).provide("pixiAppData", appData);
  const nodeRoot = new GElement();

  let lastWidth = 0;
  let lastHeight = 0;
  function checkUpdateDims() {
    const { width, height } = pApp.screen;
    if (width !== lastWidth || height !== lastHeight) {
      lastWidth = width;
      lastHeight = height;
      appData.width = width;
      appData.height = height;
    }
  }
  checkUpdateDims();
  pApp.ticker.add(
    () => {
      checkUpdateDims();
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

export function usePixiAppData() {
  return inject<{ width: number; height: number }>("pixiAppData")!;
}

export function usePixiAnimation(fn: (ticker: PIXI.Ticker) => void) {
  const app = usePixiApp();
  app.ticker.add(fn);
  onUnmounted(() => {
    app.ticker.remove(fn);
  });
}
