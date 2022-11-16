import { render } from '@solidRender/CustomRender';
import * as PIXI from 'pixi.js';

const CountingComponent = () => {
  return (
    <cont>
      <cont>lala</cont>
      <Something></Something>
    </cont>
  );
};

function Something() {
  return new PIXI.Text('hi hello');
}

export function startSolidApp(el: HTMLCanvasElement) {
  const app = new PIXI.Application({ background: 0xaaaaaa, view: el });
  const r = render(() => <CountingComponent />, app.stage);
  return r;
}
