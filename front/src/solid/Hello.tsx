import { render, JSX } from '@solidRender/CustomRender';
import * as PIXI from 'pixi.js';
import { Accessor, createEffect, createSignal, onCleanup, Show } from 'solid-js';

const CountingComponent = () => {
  const color = createSignal(0xff0000);
  const alpha = createSignal(0xff0000);
  const G = new PIXI.Graphics();
  return (
    <cont>
      <cont x={100} y={100}>
        <cont x={200}>
          <text style={{ fill: color[0]() }} text="hello"></text>
        </cont>
      </cont>
      {alpha[0]() > 0.5 ? (
        <Square
          color={color[0]()}
          alpha={alpha[0]()}
          onMouseEnter={() => color[1](0xffff00)}
          onMouseLeave={() => color[1](0xff0000)}
        ></Square>
      ) : (
        <></>
      )}
    </cont>
  );
};

function Square(arg: {
  color: number;
  alpha: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const g = new PIXI.Graphics();
  createEffect(() => {
    g.clear();
    g.beginFill(arg.color).drawRect(0, 0, 100, 100).endFill();
  });
  createEffect(() => {
    g.alpha = arg.alpha;
  });
  g.interactive = true;
  g.addListener('mouseenter', arg.onMouseEnter);
  g.addListener('mouseleave', arg.onMouseLeave);
  onCleanup(() => g.destroy());
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
