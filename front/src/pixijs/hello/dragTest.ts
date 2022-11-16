import * as PIXI from 'pixi.js';
import { fromEvent, fromEventPattern, switchMap, takeUntil } from 'rxjs';
export function startTest(el: HTMLElement) {
  const app = new PIXI.Application<HTMLCanvasElement>({});
  el.appendChild(app.view);
  const sprite = PIXI.Sprite.from('./afsdf.png');
  const graphics = new PIXI.Graphics();
  graphics.lineStyle({ width: 1, color: 0xff0000 });
  graphics.drawRect(0, 0, 200, 200);
  const text = new PIXI.Text('this is a rectangle');
  graphics.addChild(text);
  console.log(graphics);
  graphics.hitArea = {
    contains: (x, y) => {
      return x < 200 && y < 200 && x >= 0 && y >= 0;
    },
  };

  app.stage.addChild(graphics);
  app.stage.addChild(sprite);

  graphics.interactive = true;
  sprite.interactive = true;
  spriteDrag(sprite).subscribe((event) => {
    sprite.x += event.movementX;
    sprite.y += event.movementY;
  });
  spriteDrag(graphics).subscribe((event) => {
    graphics.x += event.movementX;
    graphics.y += event.movementY;
  });
  graphics.scale.set(5, 1);
}

function spriteDrag(sprite: PIXI.Container) {
  return fromEventPattern<PIXI.PointerEvents>(
    (add) => sprite.on('mousedown', add),
    (remove) => sprite.removeListener('mousedown', remove)
  ).pipe(
    switchMap(() =>
      fromEvent<MouseEvent>(window, 'mousemove').pipe(
        takeUntil(fromEvent(window, 'mouseup'))
      )
    )
  );
}
