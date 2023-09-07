<template>
  <div class="flex flex-col h-screen w-screen overflow-hidden">
    <div class="flex px-2 py-4 gap-2 bg-sky-200 border-sky-600 border-b-2">
      <input type="range" :min="0" :max="Math.PI" :step="0.01" v-model.number="rotY" />
      <input type="range" :min="0" :max="Math.PI" :step="0.01" v-model.number="rotX" />
      <input v-model="plane" />
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
const plane = ref('20 20 20');
const { canvas, pixelSize, size } = useCanvasDPI();
const m = computed(() => Chart.mFromRot(rotY.value, rotX.value, size.width, size.height));

function parsePlane() {
  const [x, y, z] = plane.value.split(' ').map(Number);
  if (isNaN(x) || isNaN(y) || isNaN(z)) return null;
  return [x, y, z] as vec3;
}

watchEffect(() => {
  const ctx = canvas.value?.getContext('2d');
  if (ctx) {
    new Chart(ctx, m.value).draw((chart) => {
      chart.ctx.lineWidth = 1;
      chart.drawAxis();
      const plane = parsePlane();
      if (plane) {
        chart.drawPlane(plane);
        const w = vec3.fromValues(20, 10, 0);
        const p = chart.projectOnPlane(plane, w);
        chart.ctx.fillStyle = '#888800';
        chart.ctx.strokeStyle = '#888800';
        chart.drawVec(p, { text: 'p', _start: plane });
        chart.ctx.fillStyle = '#008800';
        chart.ctx.strokeStyle = '#008800';
        chart.drawVec(w, { text: 'w' });
      }
    });
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

  projectOnPlane(plane: vec3, v: vec3) {
    const n = vec3.normalize(vec3.create(), plane);
    const d = vec3.dot(n, v);
    const p = vec3.scale(vec3.create(), n, d);
    return vec3.sub(vec3.create(), v, p);
  }

  draw(fn: (ctx: Chart) => void) {
    const { width, height } = pixelSize.value;
    const ctx = this.ctx;
    ctx.save();
    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.clearRect(0, 0, width, height);
    fn(this);
    ctx.restore();
  }

  drawAxis() {
    this.drawVec([40, 0, 0], { text: 'x' });
    this.drawVec([0, 40, 0], { text: 'y' });
    this.drawVec([0, 0, 40], { text: 'z' });
  }

  drawPlane(v: vec3, { fill = '#ff000044', vecsColor = '#ff0000' } = {}) {
    this.ctx.strokeStyle = vecsColor;
    this.ctx.fillStyle = vecsColor;
    this.drawVec(v, { text: 'v' });
    const c1 = vec3.cross(vec3.create(), v, [1, 0, 0]);
    vec3.normalize(c1, c1);
    const c2 = vec3.cross(vec3.create(), v, c1);
    vec3.normalize(c2, c2);
    vec3.scale(c1, c1, 20);
    vec3.scale(c2, c2, 20);
    this.drawVec(c1, { text: 'c1', _start: v });
    this.drawVec(c2, { text: 'c2', _start: v });
    const minusC1 = vec3.scale(vec3.create(), c1, -1);
    const minusC2 = vec3.scale(vec3.create(), c2, -1);
    const points = [
      vec3.add(vec3.create(), minusC1, minusC2),
      vec3.add(vec3.create(), minusC1, c2),
      vec3.add(vec3.create(), c1, c2),
      vec3.add(vec3.create(), c1, minusC2),
    ];
    this.polygon(points.map((p) => vec3.add(vec3.create(), p, v)));
    this.ctx.fillStyle = fill;
    this.ctx.fill();
  }

  polygon(points: vec3[]) {
    const ctx = this.ctx;
    ctx.beginPath();
    const p = this.transformPoint(points[0]);
    ctx.moveTo(p[0], p[1]);
    for (let i = 1; i < points.length; i++) {
      const p = this.transformPoint(points[i]);
      ctx.lineTo(p[0], p[1]);
    }
    ctx.closePath();
  }

  transformPoint(p: vec3) {
    return vec4.transformMat4(vec4.create(), [p[0], p[1], p[2], 1], this.m);
  }

  drawVec(_v: vec3, { _start = [0, 0, 0] as vec3, text = '' } = {}) {
    const ctx = this.ctx;
    const p1 = this.transformPoint(_start);
    const p2 = this.transformPoint(vec3.add(vec3.create(), _v, _start));
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.fillRect(p2[0] - 3, p2[1] - 3, 6, 6);
    ctx.stroke();
    ctx.font = '13px sans-serif';
    ctx.fillText(text, p2[0] + 10, p2[1] + 10);
  }
}
</script>
