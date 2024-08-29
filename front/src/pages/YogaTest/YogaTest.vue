<template>
  <div
    class="w-screen h-screen flex flex-col bg-sec-950 text-prime-200 touch-none"
    @pointerup="onPointerUp"
  >
    <input
      type="text"
      class="bg-sec-900 w-96 border-high-200 border mb-2"
      v-model="textValue"
    />
    <input type="text" class="bg-sec-900 w-96 border-high-200 border" v-model="simText" />
    <div class="min-h-20">event path: {{ eventPath }}</div>
    <canvas
      class="grow"
      ref="canvas"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @click="onClick"
    >
    </canvas>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue';
import { useAnimationFrames, useCanvasDPI } from '../../utils/rxjsUtils';
import Yoga from 'yoga-layout';
import { BoxEl } from './BoxEl';

enum States {
  IDLE,
  POINTERDOWN,
  DRAG,
}

const { canvas, size } = useCanvasDPI();
const measureCtx = new OffscreenCanvas(0, 0).getContext('2d')!;
const eventPath = ref('');
const textValue = ref('C 1');
const simText = ref('Sim.');
const isDragging = computed(() => state.value === States.DRAG);
const showResults = ref(false);
const fontSize = ref(20);
const orderTop = ref(30);
const state = ref(States.IDLE);
const isOverOrder = ref(false);
const { root, quantityText, simulatorText, orderContainer, closeBTN, resultsBox } =
  makeOrder();

watchEffect(() => {
  orderContainer.layout.setPosition(Yoga.EDGE_TOP, orderTop.value);
  orderContainer.layout.setPosition(Yoga.EDGE_LEFT, 30);

  if (showResults.value) {
    resultsBox.layout.setDisplay(Yoga.DISPLAY_FLEX);
  } else {
    resultsBox.layout.setDisplay(Yoga.DISPLAY_NONE);
  }
  root.layout.setWidth(size.width);
  root.layout.setHeight(size.height);
});

watchEffect(() => {
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

  const simulatorTextBoundings = textWidthAndHeight('20px Arial', simText.value);
  simulatorText.layout.setWidth(simulatorTextBoundings.width);
  simulatorText.layout.setHeight(simulatorTextBoundings.height);
  simulatorText.render = (ctx) => {
    ctx.font = `${fontSize.value}px Arial`;
    ctx.fillStyle = 'white';
    ctx.textBaseline = 'top';
    ctx.fillText(simText.value, 0, 0);
  };
});

function makeOrder() {
  const root = new BoxEl('root box');
  root.layout.setPadding(Yoga.EDGE_ALL, 30);
  root.layout.setAlignItems(Yoga.ALIGN_FLEX_START);
  root.layout.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);

  const orderContainer = new BoxEl('order container');
  orderContainer.render = (ctx) => {
    if (!isOverOrder.value) {
      ctx.globalAlpha = 0.9;
    }
  };
  orderContainer.layout.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
  orderContainer.layout.setPositionType(Yoga.POSITION_TYPE_ABSOLUTE);

  const orderBody = new BoxEl('order body');
  orderBody.layout.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
  orderBody.layout.setPadding(Yoga.EDGE_ALL, 1);
  orderBody.render = (ctx) => {
    ctx.fillStyle = '#5a4e1b';
    ctx.beginPath();
    ctx.roundRect(0, 0, orderBody.width(), orderBody.height(), 3);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.roundRect(0, 0, orderBody.width(), orderBody.height(), 3);
    ctx.strokeStyle = '#e8e837';
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

  const simulatorBox = new BoxEl('simulator box');
  simulatorBox.layout.setPadding(Yoga.EDGE_HORIZONTAL, 10);

  const simulatorText = new BoxEl('simulator text');
  simulatorBox.insertChild(simulatorText);

  simulatorBox.layout.setJustifyContent(Yoga.JUSTIFY_CENTER);
  simulatorBox.render = (ctx) => {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.roundRect(0, 0, simulatorBox.width(), simulatorBox.height(), 3);
    ctx.fill();
    ctx.closePath();
  };

  const resultsBox = new BoxEl('results box');
  resultsBox.layout.setPadding(Yoga.EDGE_HORIZONTAL, 10);
  resultsBox.layout.setJustifyContent(Yoga.JUSTIFY_CENTER);
  resultsBox.render = (ctx) => {
    ctx.fillStyle = '#489d48';
    ctx.beginPath();
    ctx.roundRect(0, 0, resultsBox.width(), resultsBox.height(), 3);
    ctx.fill();
    ctx.closePath();
  };

  const resultsText = new BoxEl('results text');
  const resultsTextBoundings = textWidthAndHeight('20px Arial', 'R$ 100,00');
  resultsText.layout.setWidth(resultsTextBoundings.width);
  resultsText.layout.setHeight(resultsTextBoundings.height);
  resultsText.render = (ctx) => {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textBaseline = 'top';
    ctx.fillText('R$ 100,00', 0, 0);
  };
  resultsBox.insertChild(resultsText);

  const closeBTN = new BoxEl('close btn');
  closeBTN.layout.setWidth(40);
  closeBTN.layout.setHeight(40);
  closeBTN.layout.setMargin(Yoga.EDGE_LEFT, 5);
  closeBTN.render = (ctx) => {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.roundRect(0, 0, closeBTN.width(), closeBTN.height(), 3);
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.font = '20px Arial';
    ctx.textBaseline = 'top';
    ctx.moveTo(5, 5);
    ctx.lineTo(35, 35);
    ctx.moveTo(35, 5);
    ctx.lineTo(5, 35);
    ctx.stroke();
    ctx.closePath();
  };

  root.insertChild(orderContainer);
  orderContainer.insertChild(orderBody);
  orderContainer.insertChild(closeBTN);
  orderBody.insertChild(simulatorBox);
  orderBody.insertChild(quantityBox);
  orderBody.insertChild(resultsBox);
  quantityBox.insertChild(quantityText);

  return { root, quantityText, simulatorText, orderContainer, closeBTN, resultsBox };
}

function textWidthAndHeight(font: string, text: string) {
  measureCtx.font = font;
  const width = measureCtx.measureText(text).width;
  const height = measureCtx.measureText('M').width;
  return { width, height };
}

function onPointerDown(event: MouseEvent) {
  const { offsetX, offsetY } = event;
  const boxes = root.hitTest(offsetX, offsetY);
  eventPath.value = boxes.map((box) => box.id).join(' -> ');
  const hitsOrderContainer = boxes.find((box) => box === orderContainer);
  if (hitsOrderContainer) {
    state.value = States.POINTERDOWN;
  }
}

function onPointerMove(event: MouseEvent) {
  isOverOrder.value = root.hitTest(event.offsetX, event.offsetY).includes(orderContainer);
  if (state.value === States.POINTERDOWN) {
    state.value = States.DRAG;
  }
  if (!isDragging.value) return;
  const { movementY } = event;
  orderTop.value += movementY;
}

function onPointerUp(event: PointerEvent) {
  if (isDragging.value) {
    state.value = States.IDLE;
    return;
  }
  state.value = States.IDLE;
  const { offsetX, offsetY } = event;
  const boxes = root.hitTest(offsetX, offsetY);
  const clickedOnCloseBtn = boxes.find((box) => box === closeBTN);
  const clickedOnOrder = boxes.find((box) => box === orderContainer);
  if (clickedOnCloseBtn) {
    alert('close');
  } else if (clickedOnOrder) {
    showResults.value = !showResults.value;
  }
}

function onClick(event: MouseEvent) {}

useAnimationFrames(() => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) return;

  root.calculateLayout();

  ctx.save();
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.clearRect(0, 0, size.width, size.height);
  root.draw(ctx);

  //draw absolute line
  const lineTop = closeBTN.worldTop() + closeBTN.height() / 2;
  const lineLeft = closeBTN.worldLeft() + closeBTN.width();
  ctx.strokeStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(lineLeft, lineTop);
  ctx.lineTo(lineLeft + 50, lineTop);
  ctx.lineTo(size.width - 50, 0);
  ctx.lineTo(size.width, 0);
  ctx.stroke();
  ctx.restore();
});
</script>
