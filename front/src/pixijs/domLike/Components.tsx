import { JSX } from '@solidRender/CustomRender';
import { createEffect, onCleanup } from 'solid-js';
import * as PIXI from 'pixi.js';

export function NameCell(args: { text: string; x: number }) {
  const tx = new PIXI.BitmapText(args.text, { fontName: 'black' });
  tx.interactive = true;
  createEffect(() => {
    tx.text = args.text;
    tx.x = args.x;
  });
  return tx;
}

export function Btn(
  props: WithNode<PIXI.Text> & Partial<PIXI.Text> & NativeEvents<PIXI.Text>
) {
  const txt = new PIXI.Text(props.text);
  txt.style.fontSize = 12;
  txt.interactive = true;
  nativeWatcher(props, txt);
  setupWithNode(props, txt);
  watchEvents(props, txt);
  return txt;
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

type NativeEvents<T extends { addListener(key: string, fn: any): any }> = {
  listenTo?: {
    [K in Parameters<T['addListener']>[0]]?: Parameters<T['addListener']>[1];
  };
};

function nativeWatcher<T>(args: Partial<T>, node: T) {
  const keys = Object.keys(args).filter((key) => key in node);
  createEffect(() => {
    keys.forEach((key) => {
      (node as any)[key] = (args as any)[key];
    });
  });
}

export function Graphic(
  args: PosProps & { children: PIXI.IShape[] } & { color: number; alpha?: number }
) {
  const g = new PIXI.Graphics();
  createEffect(() => {
    g.clear();
    args.children.forEach((shape) => {
      g.beginFill(args.color).drawShape(shape).endFill();
    });
    g.alpha = args.alpha || 1;
  });
  posWatcher(g, args);
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

type WithNode<T> = {
  withNode?: (n: T) => (() => void) | void;
};
