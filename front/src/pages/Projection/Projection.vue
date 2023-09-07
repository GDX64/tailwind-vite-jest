<template>
  <div class="flex flex-col h-screen w-screen overflow-hidden">
    <div class="flex px-2 py-4 gap-2 bg-sky-200 border-sky-600 border-b-2">
      <input type="range" :min="0" :max="Math.PI" :step="0.01" v-model.number="rotY" />
      <input type="range" :min="0" :max="Math.PI" :step="0.01" v-model.number="rotX" />
    </div>
    <div class="h-full grow relative bg-amber-100">
      <canvas ref="canvas" class="absolute top-0 left-0 w-full h-full"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { useAnimationFrames, useCanvasDPI } from '../../utils/rxjsUtils';
import * as d3 from 'd3';
import { mat4, vec4, vec3 } from 'gl-matrix';

const rotY = ref((10 / 12) * Math.PI);
const rotX = ref(Math.PI / 6);
const { canvas, pixelSize } = useCanvasDPI();
const m = computed(() =>
  Chart.mFromRot(rotY.value, rotX.value, pixelSize.value.width, pixelSize.value.height)
);

watchEffect(() => {
  const ctx = canvas.value?.getContext('2d');
  if (ctx) {
    new Chart(ctx, m.value).drawAxis();
  }
});

class Chart {
  constructor(public ctx: CanvasRenderingContext2D, public m: mat4) {}

  static mFromRot(rotY: number, rotX: number, width: number, height: number) {
    const rotM = mat4.create();
    const minDimension = Math.min(width, height);
    const scalingFactor = minDimension / 100;
    mat4.scale(rotM, rotM, [scalingFactor, -scalingFactor, scalingFactor]);
    mat4.mul(rotM, mat4.fromYRotation(mat4.create(), rotY), rotM);
    mat4.mul(rotM, mat4.fromXRotation(mat4.create(), rotX), rotM);
    const translation = mat4.fromTranslation(mat4.create(), [width / 2, height / 2, 0]);
    return mat4.mul(rotM, translation, rotM);
  }

  drawAxis() {
    const { width, height } = pixelSize.value;
    const ctx = this.ctx;
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    this.drawVec([40, 0, 0], { text: 'x' });
    this.drawVec([0, 40, 0], { text: 'y' });
    this.drawVec([0, 0, 40], { text: 'z' });
    ctx.restore();
  }

  drawVec(_v: vec3, { _start = [0, 0, 0] as vec3, text = '' } = {}) {
    const ctx = this.ctx;
    const _p2 = vec3.add(vec3.create(), _v, _start);
    const start = [_start[0], _start[1], _start[2], 1] as vec4;
    const p1 = vec4.transformMat4(vec4.create(), start, this.m);
    const p2 = vec4.transformMat4(vec4.create(), [_p2[0], _p2[1], _p2[2], 1], this.m);
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.fillRect(p2[0] - 3, p2[1] - 3, 6, 6);
    ctx.stroke();
    ctx.font = '20px serif';
    ctx.fillText(text, p2[0] + 10, p2[1] + 10);
  }
}
</script>
