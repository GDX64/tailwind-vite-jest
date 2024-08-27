<template>
  <div class="w-screen h-screen flex flex-col">
    <canvas class="grow" ref="canvas"> </canvas>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';
import { useAnimationFrames, useCanvasDPI } from '../../utils/rxjsUtils';
import Yoga, { Node } from 'yoga-layout';

const measureCtx = new OffscreenCanvas(0, 0).getContext('2d')!;

class BoxEl {
  layout: Node = Yoga.Node.create();
  children: BoxEl[] = [];
  render?: (ctx: CanvasRenderingContext2D) => void = undefined;
  constructor() {}

  insertChildren(box: BoxEl) {
    this.children.push(box);
    this.layout.insertChild(box.layout, this.children.length - 1);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.layout.getComputedLeft(), this.layout.getComputedTop());
    this.render?.(ctx);
    this.children.forEach((child) => child.draw(ctx));
    ctx.restore();
  }
}

const root = new BoxEl();

const b1 = new BoxEl();
b1.render = (ctx) => {
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(0, 0, b1.layout.getComputedWidth(), b1.layout.getComputedHeight());
};
b1.layout.setWidth(200);
b1.layout.setHeight(200);
b1.layout.setAlignItems(Yoga.ALIGN_CENTER);
b1.layout.setJustifyContent(Yoga.JUSTIFY_CENTER);

const b1Text = new BoxEl();
b1Text.render = (ctx) => {
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px Arial';
  ctx.fillText('Hello World', 0, 20);
};

measureCtx.font = '20px Arial';
const b1TextWidth = measureCtx.measureText('Hello World').width;
b1Text.layout.setWidth(b1TextWidth);
b1Text.layout.setHeight(25);
b1.insertChildren(b1Text);

const b2 = new BoxEl();
b2.render = (ctx) => {
  ctx.fillStyle = '#ffff00';
  ctx.fillRect(0, 0, b2.layout.getComputedWidth(), b2.layout.getComputedHeight());
};

b2.layout.setWidth(200);
b2.layout.setHeight(200);

root.insertChildren(b1);
root.insertChildren(b2);

const { canvas, pixelSize, size } = useCanvasDPI();

watchEffect(() => {
  root.layout.calculateLayout(size.width, size.height);
});

useAnimationFrames(() => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.clearRect(0, 0, size.width, size.height);
  ctx.scale(devicePixelRatio, devicePixelRatio);
  root.draw(ctx);
  ctx.restore();
});
</script>
