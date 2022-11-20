import { JSX } from '@solidRender/CustomRender';
import { createEffect, onCleanup } from 'solid-js';
import * as PIXI from 'pixi.js';

export function NameCell(props: Essentials<PIXI.BitmapText> & { fontName?: string }) {
  const txt = new PIXI.BitmapText(props.p_text ?? '', {
    fontName: props.fontName ?? 'black',
  });
  setupEssentials(props, txt);
  return txt;
}

export function Btn(props: Essentials<PIXI.Text>) {
  const txt = new PIXI.Text(props.p_text);
  txt.style.fontSize = 12;
  txt.interactive = true;
  setupEssentials(props, txt);
  return txt;
}

export function Graphic(
  args: { children: PIXI.IShape[] } & {
    color: number;
    alpha?: number;
  } & Essentials<PIXI.Graphics>
) {
  const g = new PIXI.Graphics();
  setupEssentials(args, g);
  createEffect(() => {
    g.clear();
    args.children.forEach((shape) => {
      g.beginFill(args.color).drawShape(shape).endFill();
    });
    g.alpha = args.alpha || 1;
  });
  return g;
}

type PosProps = { x?: number; y?: number };

function posWatcher(el: JSX.Element, pos: PosProps) {
  createEffect(() => {
    el.x = pos.x ?? el.x;
    el.y = pos.y ?? el.y;
  });
}

function setupWithNode<T>(args: WithNode<T>, node: T) {
  if (!args.withNode) {
    return;
  }
  createEffect(() => {
    const fn = args.withNode?.(node);
    if (fn) {
      onCleanup(fn);
    }
  });
}

function watchEvents<T extends { addListener(key: string, fn: any): any }>(
  props: NativeEvents<T>,
  node: T
) {
  if (!props.listenTo) {
    return;
  }
  createEffect(() => {
    for (let key in props.listenTo) {
      node.addListener(key, (props.listenTo as any)[key]);
    }
  });
}

function nativeWatcher<T>(args: Pixed<T>, node: T) {
  const expression = Object.keys(args)
    .filter((key) => key.startsWith(pixedPrefix))
    .map((p_key) => {
      const key = p_key.slice(sizeofPrefix);
      return `(node['${key}']=args['${p_key}']);`;
    })
    .join('');
  const func = new Function('node', 'args', `${expression}`);
  createEffect(() => func(node, args));
}

function setupEssentials<T extends { addListener(key: string, fn: any): any }>(
  props: Essentials<T>,
  node: T
) {
  nativeWatcher(props, node);
  setupWithNode(props, node);
  watchEvents(props, node);
}

const pixedPrefix = 'p_';
const sizeofPrefix = pixedPrefix.length;

type Pixed<T> = {
  [K in keyof T as K extends string ? `${typeof pixedPrefix}${K}` : never]?: T[K];
};

type Essentials<T> = WithNode<T> & Pixed<T> & NativeEvents<T>;

type NativeEvents<T> = T extends { addListener(key: string, fn: any): any }
  ? {
      listenTo?: {
        [K in Parameters<T['addListener']>[0]]?: Parameters<T['addListener']>[1];
      };
    }
  : never;

type WithNode<T> = {
  withNode?: (n: T) => (() => void) | void;
};
