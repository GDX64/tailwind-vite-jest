import { render, JSX } from '@solidRender/CustomRender';
import * as PIXI from 'pixi.js';
import { Accessor, createEffect, createSignal } from 'solid-js';

const CountingComponent = () => {
  const color = createSignal(0xff0000);
  window.setColor = color[1];
  return (
    <cont>
      <cont x={100} y={100}>
        <cont x={200}>
          <text style={{ fill: color[0]() }} text="hello"></text>
        </cont>
      </cont>
      <Square color={color[0]()}></Square>
    </cont>
  );
};

function Square(arg: { color: number }) {
  const g = new PIXI.Graphics();
  createEffect(() => {
    g.clear();
    g.beginFill(arg.color).drawRect(0, 0, 100, 100).endFill();
  });
  return g;
}

export function startSolidApp(el: HTMLCanvasElement) {
  const app = new PIXI.Application({
    background: 0xaaaaaa,
    view: el,
    resolution: devicePixelRatio,
  });
  const r = render(() => <CountingComponent />, app.stage);
  return r;
}
