import { createRenderer, Component, reactive, watchEffect, effectScope } from 'vue';
import * as PIXI from 'pixi.js';
import { ChartType } from './interfaces';
import Rough from 'roughjs';
import { RoughGenerator } from 'roughjs/bin/generator';
import { Drawable, Options } from 'roughjs/bin/core';
import * as d3 from 'd3';

function appRenderer(canvas: HTMLCanvasElement) {
  const shapes = new WeakMap<any, Rect>();
  const generator = Rough.generator();

  const { createApp } = createRenderer<PIXI.Container, PIXI.Container>({
    createComment(text) {
      return new PIXI.Text(text);
    },
    createElement(type, isSVG, isCustomizedBuiltIn, vnodeProps) {
      console.log('creating element');
      // console.log('create', type);
      if (type === ChartType.TEXT) return new PIXI.Text();
      if (type === ChartType.RECT) {
        const rect = new Rect(generator);
        shapes.set(rect.g, rect);
        return rect.g;
      }
      return new PIXI.Container();
    },
    createText(text) {
      // console.log('create text');
      return new PIXI.Text(text);
    },
    insert(el, parent, anchor) {
      parent.addChild(el);
    },
    nextSibling(node) {
      return null;
    },
    parentNode(node) {
      return node?.parent ?? null;
    },
    patchProp(
      _el,
      key,
      prevValue,
      nextValue,
      isSVG,
      prevChildren,
      parentComponent,
      parentSuspense,
      unmountChildren
    ) {
      const el = shapes.get(_el);
      if (!el) return;
      el.patch(key, nextValue);
    },
    remove(el) {
      el.parent?.removeChild(el);
      shapes.get(el)?.scope.stop();
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

export function createRoot(canvas: HTMLCanvasElement, comp: Component, props: any) {
  const pApp = new PIXI.Application({
    view: canvas,
    backgroundColor: 0xaaffff,
    antialias: true,
  });
  const app = appRenderer(canvas).createApp(comp, { props });
  app.mount(pApp.stage);
  return () => {
    app.unmount();
    pApp.destroy();
  };
}

type PRotation = { rotation?: number };

class Rect {
  g = new PIXI.Graphics();
  data: { x: number; y: number; w: number; h: number } & Options & PRotation = reactive({
    x: 0,
    y: 0,
    w: 100,
    h: 100,
  });
  scope;

  constructor(private gen: RoughGenerator) {
    this.scope = effectScope();
    this.scope.run(() => {
      watchEffect(() => {
        this.draw();
      });
      watchEffect(() => {
        this.g.rotation = this.data.rotation ?? 0;
      });
    });
  }

  patch(_key: string, value: any) {
    const isEvent = _key.startsWith('on');
    const key = isEvent ? _key.toLocaleLowerCase() : _key;
    if (isEvent) {
      console.log('event patch', key);
      this.g.eventMode = 'static';
      this.g.interactive = true;
      this.g.onclick = value;
    } else {
      (this.data as any)[key] = value;
    }
  }

  draw() {
    const { x, y, w, h } = this.data;
    const rGen = this.gen.rectangle(x, y, w, h, {
      fill: 'green',
      stroke: 'red',
      fillWeight: 3,
      hachureGap: 10,
    });
    console.log(rGen);
    this.g.clear();
    toPixiGraphic(rGen, this.g);
  }
}

function toPixiGraphic(d: Drawable, g: PIXI.Graphics) {
  d.sets.forEach((set) => {
    if (set.type === 'path' || set.type === 'fillSketch') {
      if (set.type === 'fillSketch') {
        // g.beginFill(0x000);
        g.lineStyle(d.options.fillWeight, d.options.fill);
      } else {
        g.lineStyle(d.options.strokeWidth, d.options.stroke);
      }
      set.ops.forEach((op) => {
        if (op.op === 'bcurveTo') {
          g.bezierCurveTo(
            ...(op.data as [number, number, number, number, number, number])
          );
        } else if (op.op === 'lineTo') {
          g.lineTo(op.data[0], op.data[1]);
        } else if (op.op === 'move') {
          g.moveTo(op.data[0], op.data[1]);
        }
      });
      if (set.type === 'fillSketch') {
        // g.endFill();
      }
    }
  });
}
