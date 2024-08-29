<template>
  <div class="w-screen h-screen flex flex-col">
    <input type="text" v-model="textValue" />
    <input type="range" v-model.number="fontSize" min="10" max="50" />
    <canvas class="grow" ref="canvas" @click="hitTest"> </canvas>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';
import { useAnimationFrames, useCanvasDPI } from '../../utils/rxjsUtils';
import Yoga, { Node } from 'yoga-layout';
import { BoxEl } from './BoxEl';

const { canvas, size } = useCanvasDPI();
const measureCtx = new OffscreenCanvas(0, 0).getContext('2d')!;
const textValue = ref('Compra 1');
const fontSize = ref(20);
const root = makeOrder();

function makeOrder() {
  const root = new BoxEl('root box');
  root.layout.setPadding(Yoga.EDGE_ALL, 30);
  root.layout.setAlignItems(Yoga.ALIGN_FLEX_START);
  root.layout.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
  const orderBody = new BoxEl('order body');
  orderBody.layout.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
  orderBody.render = (ctx) => {
    ctx.fillStyle = '#7a7a1d';
    ctx.beginPath();
    ctx.roundRect(0, 0, orderBody.width(), orderBody.height(), 3);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.roundRect(0, 0, orderBody.width(), orderBody.height(), 3);
    ctx.strokeStyle = '#ffff00';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
  };
  orderBody.layout.setHeight(40);
  orderBody.layout.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
  const quantityBox = new BoxEl('quantity box');

  quantityBox.layout.setJustifyContent(Yoga.JUSTIFY_CENTER);
  quantityBox.layout.setPadding(Yoga.EDGE_HORIZONTAL, 10);
  const quantityText = new BoxEl('quantity text');

  const qunatityTextBoundings = textWidthAndHeight(
    `${fontSize.value}px Arial`,
    textValue.value
  );
  quantityText.layout.setWidth(qunatityTextBoundings.width);
  quantityText.layout.setHeight(qunatityTextBoundings.height);

  quantityText.render = (ctx) => {
    ctx.font = `${fontSize.value}px Arial`;
    ctx.fillStyle = 'white';
    ctx.textBaseline = 'top';
    ctx.fillText(textValue.value, 0, 0);
  };

  const simulatorBox = new BoxEl('simulator box');
  simulatorBox.layout.setPadding(Yoga.EDGE_HORIZONTAL, 10);

  const simulatorText = new BoxEl('simulator text');
  simulatorBox.insertChild(simulatorText);
  const simulatorTextBoundings = textWidthAndHeight('20px Arial', 'Simulador');
  simulatorText.layout.setWidth(simulatorTextBoundings.width);
  simulatorText.layout.setHeight(simulatorTextBoundings.height);

  simulatorBox.layout.setJustifyContent(Yoga.JUSTIFY_CENTER);
  simulatorText.render = (ctx) => {
    ctx.font = `${fontSize.value}px Arial`;
    ctx.fillStyle = 'white';
    ctx.textBaseline = 'top';
    ctx.fillText('Simulador', 0, 0);
  };
  simulatorBox.render = (ctx) => {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.roundRect(0, 0, simulatorBox.width(), simulatorBox.height(), 3);
    ctx.fill();
    ctx.closePath();
  };

  root.insertChild(orderBody);
  orderBody.insertChild(simulatorBox);
  orderBody.insertChild(quantityBox);
  quantityBox.insertChild(quantityText);

  return root;
}

function textWidthAndHeight(font: string, text: string) {
  measureCtx.font = font;
  const width = measureCtx.measureText(text).width;
  const height = measureCtx.measureText('M').width;
  return { width, height };
}

function hitTest(event: MouseEvent) {
  const { offsetX, offsetY } = event;
  const boxes = root.hitTest(offsetX, offsetY);
  console.log(boxes.map((box) => box.id));
}

useAnimationFrames(() => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) return;

  root.layout.calculateLayout(size.width, size.height);
  ctx.save();
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.clearRect(0, 0, size.width, size.height);
  root.draw(ctx);
  ctx.restore();
});
</script>
