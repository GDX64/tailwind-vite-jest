import {
  createRenderer,
  Component,
  reactive,
  watchEffect,
  effectScope,
  EffectScope,
} from 'vue';
import * as PIXI from 'pixi.js';
import { ChartType, ScaleXY } from './interfaces';
import Rough from 'roughjs';
import { RoughGenerator } from 'roughjs/bin/generator';
import { Drawable, Op, Options } from 'roughjs/bin/core';
import * as d3 from 'd3';

function appRenderer(canvas: HTMLCanvasElement) {
  const shapes = new WeakMap<any, BasicShape>();
  const generator = Rough.generator();

  const { createApp } = createRenderer<PIXI.Container, PIXI.Container>({
    createComment(text) {
      return new PIXI.Text(text);
    },
    createElement(type, isSVG, isCustomizedBuiltIn, vnodeProps) {
      if (type === ChartType.TEXT) return new PIXI.Text();
      if (type === ChartType.RECT) {
        const rect = new Rect(generator);
        shapes.set(rect.g, rect);
        return rect.g;
      }
      if (type === ChartType.LINE) {
        const shape = new Line(generator);
        shapes.set(shape.g, shape);
        return shape.g;
      }
      const group = new Group();
      shapes.set(group.container, group);
      return group.container;
    },
    createText(text) {
      return new PIXI.Text(text);
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
      const index = node.parent.children.findIndex((item) => item === node);
      return node.parent.children[index + 1] as PIXI.Container;
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
      shapes.get(el)?.destroy();
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
  canvas: HTMLCanvasElement,
  comp: Component,
  props: any,
  injected: any
) {
  const pApp = new PIXI.Application({
    view: canvas,
    backgroundColor: 0xffffff,
    antialias: true,
    resolution: devicePixelRatio,
    resizeTo: canvas,
  });
  const app = appRenderer(canvas).createApp(comp, { props });
  app.provide('drawData', injected);
  app.mount(pApp.stage);
  return {
    destroy: () => {
      app.unmount();
      pApp.destroy();
    },
    pApp,
  };
}

type PRotation = { rotation?: number };

interface BasicShape {
  patch(key: string, value: any): void;
  destroy(): void;
}

export class Line implements BasicShape {
  g = new PIXI.Graphics();
  data: {
    points: [number, number][];
    curve?: boolean;
    y?: number;
    x?: number;
    scaleXY?: ScaleXY;
  } & BasicOptions &
    PRotation = reactive({
    points: [],
    seed: Math.random() * 1000,
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
        if (this.data.scaleXY) {
          this.g.x = this.data.scaleXY.alphaX * (this.data.x ?? 0);
          this.g.y = this.data.scaleXY.alphaY * (this.data.y ?? 0);
        } else {
          this.g.x = this.data.x ?? 0;
          this.g.y = this.data.y ?? 0;
        }
      });
    });
  }

  destroy() {
    this.scope.stop();
    this.g.destroy();
  }

  patch(_key: string, value: any) {
    const isEvent = _key.startsWith('on');
    const key = isEvent ? _key.toLocaleLowerCase() : _key;
    if (isEvent) {
      this.g.eventMode = 'static';
      (this.g as any)[key] = value;
    } else {
      (this.data as any)[key] = value;
    }
  }

  draw() {
    let { points, curve } = this.data;
    if (points.length < 2) return;
    const scale = this.data.scaleXY;
    if (scale) {
      points = points.map((p) => [scale.x(p[0]), scale.y(p[1])]);
    }
    const rGen = curve
      ? this.gen.curve(points, extractOptions(this.data))
      : this.gen.linearPath(points, extractOptions(this.data));
    this.g.clear();
    toPixiGraphic(rGen, this.g, this.data.fillOpacity ?? 1);
  }
}

class Group implements BasicShape {
  id = Math.random() * 1000;
  container = new PIXI.Container();
  data: {
    x: number;
    y: number;
    cache?: boolean;
    scaleXY?: ScaleXY;
  } & BasicOptions &
    PRotation = reactive({
    x: 0,
    y: 0,
    w: 100,
    h: 100,
  });
  scope;

  constructor() {
    this.scope = effectScope();
    this.scope.run(() => {
      watchEffect(() => {
        this.container.rotation = this.data.rotation ?? 0;
        if (this.data.scaleXY) {
          this.container.x = this.data.scaleXY.alphaX * (this.data.x ?? 0);
          this.container.y = this.data.scaleXY.alphaY * (this.data.y ?? 0);
        } else {
          this.container.x = this.data.x ?? 0;
          this.container.y = this.data.y ?? 0;
        }
      });
    });
  }

  destroy() {
    this.scope.stop();
    this.container.destroy();
  }

  patch(_key: string, value: any) {
    const isEvent = _key.startsWith('on');
    const key = isEvent ? _key.toLocaleLowerCase() : _key;
    if (isEvent) {
      this.container.eventMode = 'static';
      (this.container as any)[key] = value;
    } else {
      (this.data as any)[key] = value;
    }
  }
}

class Rect implements BasicShape {
  id = Math.random() * 1000;
  g = new PIXI.Graphics();
  data: {
    x: number;
    y: number;
    w: number;
    h: number;
    centerPivot?: number;
    cache?: boolean;
    scaleXY?: ScaleXY;
  } & BasicOptions &
    PRotation = reactive({
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
        this.g.alpha = this.data.opacity ?? 1;
        if (this.data.scaleXY) {
          this.g.x = this.data.scaleXY.alphaX * (this.data.x ?? 0);
          this.g.y = this.data.scaleXY.alphaY * (this.data.y ?? 0);
        } else {
          this.g.x = this.data.x ?? 0;
          this.g.y = this.data.y ?? 0;
        }
      });
    });
  }

  destroy() {
    this.scope.stop();
    this.g.destroy();
  }

  patch(_key: string, value: any) {
    const isEvent = _key.startsWith('on');
    const key = isEvent ? _key.toLocaleLowerCase() : _key;
    if (isEvent) {
      this.g.eventMode = 'static';
      (this.g as any)[key] = value;
    } else {
      (this.data as any)[key] = value;
    }
  }

  draw() {
    let { w, h, cache } = this.data;
    w *= this.data.scaleXY?.alphaX ?? 1;
    h *= this.data.scaleXY?.alphaY ?? 1;
    const rGen = this.gen.rectangle(0, 0, w, h, extractOptions(this.data));
    this.g.clear();
    this.g.hitArea = new PIXI.Rectangle(0, 0, w, h);
    toPixiGraphic(rGen, this.g, this.data.fillOpacity ?? 1);
    this.g.cacheAsBitmap = cache ?? false;
    if (this.data.centerPivot) {
      this.g.pivot = { x: w / 2, y: h / 2 };
    }
  }
}

function extractOptions(ops: Options): Options {
  const result: Options = {
    fill: ops.fill,
    roughness: ops.roughness ?? 1,
    bowing: ops.bowing ?? 1,
    fillWeight: ops.fillWeight ?? 1,
    stroke: ops.stroke ?? 'black',
    fillStyle: ops.fillStyle,
    seed: ops.seed,
    strokeWidth: ops.strokeWidth ?? 1,
    disableMultiStroke: ops.disableMultiStroke ?? false,
  };
  if (ops.hachureAngle) result.hachureAngle = ops.hachureAngle;
  if (ops.hachureGap) result.hachureGap = ops.hachureGap;
  return result;
}

function toPixiGraphic(d: Drawable, g: PIXI.Graphics, fillOpacity = 1) {
  d.sets.forEach((set) => {
    if (set.type === 'path' || set.type === 'fillSketch') {
      if (set.type === 'fillSketch') {
        g.lineStyle(d.options.fillWeight, d.options.fill);
      } else {
        g.lineStyle(d.options.strokeWidth, d.options.stroke);
      }
      set.ops.forEach(operationOnGraphics);
    } else {
      g.beginFill(d.options.fill, fillOpacity);
      set.ops.forEach(operationOnGraphics);
      g.endFill();
    }
  });

  function operationOnGraphics(op: Op) {
    if (op.op === 'bcurveTo') {
      g.bezierCurveTo(...(op.data as [number, number, number, number, number, number]));
    } else if (op.op === 'lineTo') {
      g.lineTo(op.data[0], op.data[1]);
    } else if (op.op === 'move') {
      g.moveTo(op.data[0], op.data[1]);
    }
  }
}

type BasicOptions = Options & { opacity?: number; fillOpacity?: number };
