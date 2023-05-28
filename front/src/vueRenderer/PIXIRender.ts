import { createRenderer, Component, markRaw } from 'vue';
import * as MainPIXI from 'pixi.js';
import * as OffPixi from '@pixi/webworker';
import { PIXIEL } from './interfaces';
import { DrawData } from './UseDraw';

const isWorker = !self.devicePixelRatio;
const PIXI = OffPixi;

function appRenderer() {
  const { createApp } = createRenderer<MainPIXI.Container, MainPIXI.Container>({
    createComment() {
      return new PIXI.Container();
    },
    createElement(type, isSVG, isCustomizedBuiltIn, vnodeProps) {
      switch (type) {
        case PIXIEL.GRAPHICS:
          return new PIXI.Graphics();
        case PIXIEL.TEXT:
          return new PIXI.Text();
        default:
          return new PIXI.Container();
      }
    },
    createText(text) {
      return new PIXI.Text(text);
    },
    insert(el, parent, anchor) {
      if (anchor) {
        const index = parent.getChildIndex(anchor);
        if (index === -1) {
          throw Error('tem coisa errada ai, irmão');
        } else {
          parent.addChildAt(el, index);
        }
      } else {
        parent.addChild(el);
      }
    },
    nextSibling(node) {
      const index = node.parent.children.findIndex((item) => item === node);
      const sibling = node.parent.children[index + 1];
      if (sibling instanceof PIXI.Container) {
        return sibling;
      }
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
      if (!el) return;
      (el as any)[key] = nextValue;
    },
    remove(el) {
      el.parent?.removeChild(el);
      el.destroy();
    },
    setElementText(node, text) {
      if (node instanceof PIXI.Text) {
        node.text = text;
      }
    },
    setText(node, text) {
      if (node instanceof PIXI.Text) {
        node.text = text;
      }
    },
  });
  return { createApp };
}

export function createRoot(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  comp: Component,
  injected: DrawData
) {
  const pApp = new PIXI.Application({
    view: canvas,
    backgroundColor: 0xffffff,
    antialias: true,
    resolution: injected.devicePixelRatio,
    width: injected.width,
    height: injected.height,
    resizeTo: isWorker ? undefined : canvas,
  });

  injected.app = markRaw(pApp);
  const app = appRenderer().createApp(comp).provide('drawData', injected);
  const instance = app.mount(pApp.stage);
  return {
    destroy: () => {
      app.unmount();
      pApp.destroy();
    },
    pApp,
    app,
    instance,
  };
}
