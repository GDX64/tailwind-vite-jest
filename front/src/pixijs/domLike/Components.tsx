import { JSX } from '@solidRender/CustomRender';
import { createEffect } from 'solid-js';
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

export function Btn(props: { value: string; onClick: () => void } & PosProps) {
  const txt = new PIXI.Text(props.value);
  txt.style.fontSize = 12;
  txt.interactive = true;
  txt.addListener('click', props.onClick);
  posWatcher(txt, props);
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
