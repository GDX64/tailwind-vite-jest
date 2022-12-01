import { render } from '@solidRender/CustomRender';
import * as PIXI from 'pixi.js';
import { animationFrames } from 'rxjs';
import { createSignal, onCleanup } from 'solid-js';
import { randRange } from '../../utils/math';
import { Btn, Graphic } from '../domLike/Components';
import * as d3 from 'd3';

export function createChart(view: HTMLCanvasElement, resolution: number) {
  const app = new PIXI.Application({
    width: 600,
    height: 600,
    view,
    background: 0xeeeeee,
    resolution,
  });
  app.stage.filters = [];
  const finish = render(() => <Chart></Chart>, app.stage);
  return () => {
    finish();
    app.destroy();
  };
}

function Chart() {
  const colorFn = d3.scaleLinear([0, 1], [0xff0000, 0x000000]);
  const [color, setColor] = createSignal(0xff0000);
  const randPos = () => randRange(100, 500);
  return (
    <cont>
      <Btn
        p_x={100}
        p_interactive={true}
        withNode={(btn) => {
          btn.addListener('click', () => setColor(colorFn(Math.random())));
        }}
      >
        random color
      </Btn>
      <Graphic
        withNode={(g) => {
          g.clear();
          const [x, y] = [200, 200];
          g.lineStyle(1, 0x0)
            .moveTo(x + 25, y - 20)
            .lineTo(x + 25, y + 50 + 20);
          g.beginFill(color()).drawRect(x, y, 50, 50).endFill();
          g.filters = [];
          g.scale = { x: 2, y: 2 };
        }}
      ></Graphic>
    </cont>
  );
}
