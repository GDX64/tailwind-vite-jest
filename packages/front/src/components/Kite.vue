<template>
  <canvas ref="canvas" class="w-full h-full"></canvas>
</template>

<script lang="ts" setup>
import { useAnimationFrames, useCanvasDPI } from '../utils/rxjsUtils';
import { mat4, vec2, vec3 } from 'gl-matrix';
import { LinScale } from '../utils/LinScale';
import R from 'roughjs';

const { canvas, pixelSize } = useCanvasDPI();

useAnimationFrames(() => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx || !pixelSize.value.width || !pixelSize.value.height) return;

  ctx.clearRect(0, 0, pixelSize.value.width, pixelSize.value.height);
  kiteDraw(ctx);
});

function projectionMatrix() {
  const matrix = mat4.create();
  mat4.perspective(
    matrix,
    Math.PI / 4,
    pixelSize.value.width / pixelSize.value.height,
    1,
    1000
  );
  return matrix;
}

function kiteDraw(ctx: CanvasRenderingContext2D) {
  const HEIGHT = 3;
  const width = (HEIGHT * 2) / 3;
  const armHeight = HEIGHT / 3;
  const down: vec3 = [0, 0, 0];
  const left: vec3 = [-width / 2, armHeight, 0];
  const up: vec3 = [0, HEIGHT, 0];
  const right: vec3 = [width / 2, armHeight, 0];
  const center: vec3 = [0, armHeight, HEIGHT / 10];

  const kite = new VertexObject();
  kite.paths[0] = [down, left, center];
  kite.paths[1] = [down, right, center];
  kite.paths[2] = [up, left, center];
  kite.paths[3] = [up, right, center];
  kite.setPosition([-center[0], -center[1], 0]);
  kite.rotateY(Date.now() / 1000);
  kite.rotateX(-Math.PI / 10);
  const camera = new Camera();
  camera.update();
  kite.draw(ctx, camera);
}

class Camera {
  position: vec3 = [0, 0, 10];
  target: vec3 = [0, 0, 0];
  up: vec3 = [0, 1, 0];
  projectionMatrix = projectionMatrix();
  viewMatrix = mat4.create();

  update() {
    mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
  }
}

class VertexObject {
  paths: vec3[][] = [];
  modelMatrix = mat4.create();

  rotateY(angle: number) {
    mat4.rotateY(this.modelMatrix, this.modelMatrix, angle);
  }

  rotateX(angle: number) {
    mat4.rotateX(this.modelMatrix, this.modelMatrix, angle);
  }

  setPosition(position: vec3) {
    mat4.translate(this.modelMatrix, this.modelMatrix, position);
  }

  vertexTransform(camera: Camera) {
    const modelMatrix = this.modelMatrix;
    const viewMatrix = camera.viewMatrix;
    const projectionMatrix = camera.projectionMatrix;
    const scaleX = LinScale.fromPoints(-1, 0, 1, pixelSize.value.width);
    const scaleY = LinScale.fromPoints(-1, 0, 1, pixelSize.value.height);
    const newPaths = this.paths.map((item) => {
      return item.map((vertex) => {
        const newVertex = vec3.create();
        vec3.transformMat4(newVertex, vertex, modelMatrix);
        vec3.transformMat4(newVertex, newVertex, viewMatrix);
        vec3.transformMat4(newVertex, newVertex, projectionMatrix);
        // now we should be in the domain of the screen [-1, 1]
        // lets put it into the canvas domain
        newVertex[0] = scaleX.scale(newVertex[0]);
        newVertex[1] = scaleY.scale(newVertex[1]);
        return newVertex;
      });
    });
    return newPaths;
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    const rough = R.canvas(ctx.canvas, {});
    for (const path of this.vertexTransform(camera)) {
      rough.polygon(path as any, {
        seed: 3,
        fill: '#f72043',
        fillStyle: 'solid',
      });
    }
  }
}
</script>
