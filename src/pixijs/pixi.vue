<template>
  <div ref="pixi"></div>
</template>

<script lang="ts" setup>
import * as PIXI from 'pixi.js';
import { fromEvent, fromEventPattern, map, switchMap, takeUntil, tap } from 'rxjs';
import { onMounted, ref } from 'vue';
const pixi = ref<HTMLElement>();
onMounted(() => {
  if (!pixi.value) throw Error('no pixi');
  const app = new PIXI.Application({});
  pixi.value.appendChild(app.view);
  const sprite = PIXI.Sprite.from('./afsdf.png');
  const graphics = new PIXI.Graphics();
  graphics.lineStyle({ width: 10, color: 0xff0000 });
  graphics.drawRect(0, 0, 500, 500);
  console.log(graphics);
  graphics.hitArea = {
    contains: (x, y) => {
      return x < 500 && y < 500 && x >= 0 && y >= 0;
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
  graphics.on('mouseover', () => {
    graphics.beginFill(0xff0000);
    graphics.drawRect(0, 0, 500, 500);
    graphics.endFill();
  });
  graphics.on('mouseout', () => {
    console.log('leave');
    graphics.beginFill(0xaa0000);
    graphics.drawRect(0, 0, 500, 500);
    graphics.endFill();
  });
});

function spriteDrag(sprite: PIXI.Container) {
  return fromEventPattern<PIXI.InteractionEvent>(
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
</script>
