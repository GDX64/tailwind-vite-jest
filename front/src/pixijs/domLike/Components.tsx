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

export function Btn(props: Essentials<PIXI.Text>) {
  const txt = new PIXI.Text(props.p_text);
  txt.style.fontSize = 12;
  txt.interactive = true;
  nativeWatcher(props, txt);
  setupWithNode(props, txt);
  watchEvents(props, txt);
  return txt;
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
    .filter((key) => key.startsWith('p_'))
    .map((p_key) => {
      const key = p_key.slice(2);
      return `(node['${key}']=args['${p_key}']);`;
    })
    .join('');
  const func = eval(`()=>{${expression}}`);
  console.log(func);
  createEffect(func);
}

type Pixed<T> = {
  [K in keyof T as K extends string ? `p_${K}` : never]?: T[K];
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
