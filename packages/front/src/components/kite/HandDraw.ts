import { mat4, vec2, vec3 } from 'gl-matrix';
import { LinScale } from '../../utils/LinScale';
import R from 'roughjs';
import { Options } from 'roughjs/bin/core';
import { PDBRope } from './PDBRope';

export class Camera {
  position: vec3 = [0, 0, 10];
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

  rotateX(angle: number) {
    mat4.rotateX(this.modelMatrix, this.modelMatrix, angle);
  }

  setPosition(position: vec3) {
    this.modelMatrix[12] = position[0];
    this.modelMatrix[13] = position[1];
    this.modelMatrix[14] = position[2];
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

export class KiteDraw {
  vertex;
  rope;
  ropeVertexPosition;
  ropeVertexObject;

  get matrix() {
    return this.vertex.modelMatrix;
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

    this.ropeVertexPosition = left;
    const ropeWorldPosition = this.getWorldPosition(this.ropeVertexPosition);
    this.rope = PDBRope.fromLength(HEIGHT / 2, 0.1, 0.1, ropeWorldPosition);
    this.ropeVertexObject = new VertexObject();
  }

  evolve(dt: number) {
    const ropePosition = this.getWorldPosition(this.ropeVertexPosition);
    this.rope.updateFirstPosition(ropePosition);
    this.rope.evolve(dt);

    const ropeVertexObject = new VertexObject();
    const vertex = this.rope.nodesPos;
    ropeVertexObject.paths = [vertex];
    this.ropeVertexObject = ropeVertexObject;
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    this.vertex.drawAsPolygon(ctx, camera, { fill: 'red', seed: 1 });
    this.ropeVertexObject.drawAsLine(ctx, camera, {
      stroke: 'black',
      seed: 1,
    });
    const rough = R.canvas(ctx.canvas);
  }
}
