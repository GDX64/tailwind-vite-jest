<template>
  <div class="w-screen h-screen flex flex-col">
    <input type="range" class="w-96" v-model.number="b1Width" min="100" max="500"></input>
    <input type="range" class="w-96" v-model.number="b2Height" min="100" max="500"></input>
    <input type="range" class="w-96" v-model.number="b1Height" min="100" max="500"></input>
    <canvas class="grow" ref="canvas"> </canvas>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';
import { useAnimationFrames, useCanvasDPI } from '../../utils/rxjsUtils';
import Yoga from 'yoga-layout';

const root = Yoga.Node.create();

const b1Width = ref(100);
const b1Height = ref(100);
const b2Height = ref(100);

const b1 = Yoga.Node.create();
b1.setWidth(100);
b1.setHeight(100);
b1.setAlignItems(Yoga.ALIGN_CENTER);
b1.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
b1.setJustifyContent(Yoga.JUSTIFY_SPACE_AROUND);

const b1Child = Yoga.Node.create();
b1.insertChild(b1Child, 0);
b1Child.setWidth(50);
b1Child.setHeight(50);

const b1Child2 = Yoga.Node.create();
b1.insertChild(b1Child2, 0);
b1Child2.setWidth(20);
b1Child2.setHeight(50);

const b2 = Yoga.Node.create();
b2.setWidth(100);
b2.setHeight(100);


root.insertChild(b2, 0);
root.insertChild(b1, 1);

const { canvas, pixelSize, size } = useCanvasDPI();

watchEffect(()=>{
  b1.setWidth(b1Width.value);
  b1.setHeight(b1Height.value);
  b2.setHeight(b2Height.value);
  root.calculateLayout(size.width, size.height);
})

useAnimationFrames(() => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.clearRect(0, 0, size.width, size.height);
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.fillStyle = 'red';

  ctx.save();
  ctx.translate(b1.getComputedLeft(), b1.getComputedTop());
  ctx.fillRect(0, 0, b1.getComputedWidth(), b1.getComputedHeight());

  ctx.save();
  ctx.translate(b1Child.getComputedLeft(), b1Child.getComputedTop());
  ctx.fillStyle = 'yellow';
  ctx.fillRect(0, 0, b1Child.getComputedWidth(), b1Child.getComputedHeight());
  ctx.restore();

  ctx.save();
  ctx.translate(b1Child2.getComputedLeft(), b1Child2.getComputedTop());
  ctx.fillStyle = 'blue';
  ctx.fillRect(0, 0, b1Child2.getComputedWidth(), b1Child2.getComputedHeight());
  ctx.restore();

  ctx.restore();

  ctx.fillStyle = 'green';
  ctx.fillRect(
    b2.getComputedLeft(),
    b2.getComputedTop(),
    b2.getComputedWidth(),
    b2.getComputedHeight()
  );

  ctx.restore();
});
</script>
