import { mat4, vec2, vec3 } from 'gl-matrix';
import { LinScale } from '../../utils/LinScale';
import R from 'roughjs';
import { Options } from 'roughjs/bin/core';
import { PBDRope } from './PDBRope';

export class Camera {
  position: vec3 = [0, 0, 20];
  target: vec3 = [0, 0, 0];
  up: vec3 = [0, 1, 0];
  projectionMatrix;
  viewMatrix = mat4.create();

  constructor(public viewportSize: vec2) {
    this.projectionMatrix = projectionMatrix(viewportSize);
  }

  update() {
    mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
  }
}

function projectionMatrix(viewportSize: vec2) {
  const matrix = mat4.create();
  mat4.perspective(matrix, Math.PI / 4, viewportSize[0] / viewportSize[1], 1, 1000);
  return matrix;
}

export class VertexObject {
  paths: vec3[][] = [];
  modelMatrix = mat4.create();

  rotateY(angle: number) {
    mat4.rotateY(this.modelMatrix, this.modelMatrix, angle);
  }

  setRotation(x: number, y: number) {
    const pos = this.getPosition();
    this.modelMatrix = mat4.create();
    mat4.rotateX(this.modelMatrix, this.modelMatrix, x);
    mat4.rotateY(this.modelMatrix, this.modelMatrix, y);
    this.setPosition(pos);
  }

  rotateX(angle: number) {
    mat4.rotateX(this.modelMatrix, this.modelMatrix, angle);
  }

  setPosition(position: vec3) {
    this.modelMatrix[12] = position[0];
    this.modelMatrix[13] = position[1];
    this.modelMatrix[14] = position[2];
  }

  getPosition() {
    return vec3.fromValues(
      this.modelMatrix[12],
      this.modelMatrix[13],
      this.modelMatrix[14]
    );
  }

  vertexTransform(camera: Camera) {
    const modelMatrix = this.modelMatrix;
    const viewMatrix = camera.viewMatrix;
    const projectionMatrix = camera.projectionMatrix;
    const scaleX = LinScale.fromPoints(-1, 0, 1, camera.viewportSize[0]);
    const scaleY = LinScale.fromPoints(1, 0, -1, camera.viewportSize[1]);
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
        return vec2.fromValues(newVertex[0], newVertex[1]);
      });
    });
    return newPaths;
  }

  drawAsPolygon(ctx: CanvasRenderingContext2D, camera: Camera, options: Options) {
    const rough = R.canvas(ctx.canvas, {});
    for (const path of this.vertexTransform(camera)) {
      rough.polygon(path as [number, number][], options);
    }
  }

  drawAsLine(ctx: CanvasRenderingContext2D, camera: Camera, options: Options) {
    const rough = R.canvas(ctx.canvas, {});
    for (const path of this.vertexTransform(camera)) {
      rough.curve(path as [number, number][], options);
    }
  }
}

type KiteRope = {
  kiteAnchor: vec3;
  rope: PBDRope;
  vertexObject: VertexObject;
};

export class KiteDraw {
  vertex;
  ropes: KiteRope[] = [];

  get matrix() {
    return this.vertex.modelMatrix;
  }

  getPosition() {
    return this.vertex.getPosition();
  }

  getWorldPosition(v: vec3) {
    const modelMatrix = this.vertex.modelMatrix;
    const worldPos = vec3.create();
    vec3.transformMat4(worldPos, v, modelMatrix);
    return worldPos;
  }

  constructor(initial: vec3) {
    const HEIGHT = 3;
    const width = (HEIGHT * 2) / 3;
    const armHeight = (2 * HEIGHT) / 3;
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
    this.vertex = kite;
    this.vertex.setPosition(initial);

    //gravity and wind
    const constForce = vec3.fromValues(0, -9.8, -10);

    {
      const ropeWorldPosition = this.getWorldPosition(left);
      const rope1 = PBDRope.fromLength(HEIGHT / 4, 0.1, 0.1, ropeWorldPosition);
      const rope1VertexObject = new VertexObject();
      this.ropes.push({
        kiteAnchor: left,
        rope: rope1,
        vertexObject: rope1VertexObject,
      });
      rope1.setConstForce(constForce);
    }
    {
      const ropeWorldPosition = this.getWorldPosition(right);
      const rope2 = PBDRope.fromLength(HEIGHT / 4, 0.1, 0.1, ropeWorldPosition);
      const rope2VertexObject = new VertexObject();
      this.ropes.push({
        kiteAnchor: right,
        rope: rope2,
        vertexObject: rope2VertexObject,
      });
      rope2.setConstForce(constForce);
    }
    {
      const ropeWorldPosition = this.getWorldPosition(down);
      const rope3 = PBDRope.fromLength(HEIGHT, 0.1, 0.1, ropeWorldPosition);
      const rope3VertexObject = new VertexObject();
      this.ropes.push({
        kiteAnchor: down,
        rope: rope3,
        vertexObject: rope3VertexObject,
      });
      rope3.setConstForce(constForce);
    }
    {
      const ropeWorldPosition = this.getWorldPosition(center);
      const ropeLength = HEIGHT * 10;
      const rope4 = PBDRope.fromLength(ropeLength, 0.5, 0.1, ropeWorldPosition);
      const rope4VertexObject = new VertexObject();
      this.ropes.push({
        kiteAnchor: center,
        rope: rope4,
        vertexObject: rope4VertexObject,
      });
      const gravity = vec3.fromValues(0, -9.8, 0);
      rope4.setConstForce(gravity);

      rope4.updateLastPosition(vec3.fromValues(0, -ropeLength * 0.7, ropeLength * 0.7));
    }
  }

  evolve(dt: number) {
    this.ropes.forEach((rope) => {
      const ropePosition = this.getWorldPosition(rope.kiteAnchor);
      rope.rope.updateFirstPosition(ropePosition);
      rope.rope.evolve(dt);

      const ropeVertexObject = new VertexObject();
      const vertex = rope.rope.nodesPos;
      ropeVertexObject.paths = [vertex];
      rope.vertexObject = ropeVertexObject;
    });
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    this.vertex.drawAsPolygon(ctx, camera, { fill: '#0ea5e9', seed: 1 });
    this.ropes.forEach((rope) => {
      rope.vertexObject.drawAsLine(ctx, camera, {
        stroke: 'black',
        seed: 1,
      });
    });
  }
}
