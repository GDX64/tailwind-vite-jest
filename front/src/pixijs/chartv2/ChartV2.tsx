import { render } from '@solidRender/CustomRender';
import * as PIXI from 'pixi.js';
import { animationFrames } from 'rxjs';
import { onCleanup } from 'solid-js';
import { randRange } from '../../utils/math';
import { Graphic } from '../domLike/Components';
import * as d3 from 'd3';

export function createChart(view: HTMLCanvasElement, resolution: number) {
  const app = new PIXI.Application({
    width: 600,
    height: 600,
    view,
    background: 0xeeeeee,
    resolution,
  });

  const finish = render(() => <Chart></Chart>, app.stage);
  return () => {
    finish();
    app.destroy();
  };
}

function Chart() {
  const color = d3.scaleLinear([0, 1], ['#fff', '#000']);
  console.log(color(0.5));
  return (
    <cont>
      <Graphic color={0xff0000}>{[]}</Graphic>
    </cont>
  );
}
