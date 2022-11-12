import * as PIXI from 'pixi.js';
import goku from './goku.png';
PIXI.settings.PREFER_ENV = PIXI.ENV.WEBGL2;

export function shaderTexture(view: HTMLCanvasElement, resolution: number) {
  const app = new PIXI.Application({ view, resolution, height: 500, width: 500 });

  const geometry = new PIXI.Geometry()
    .addAttribute(
      'aVertexPosition', // the attribute name
      [
        -100,
        -100, // x, y
        100,
        -100, // x, y
        100,
        100,
      ], // x, y
      2
    ) // the size of the attribute

    .addAttribute(
      'aColor', // the attribute name
      [
        1,
        0,
        0, // r, g, b
        0,
        1,
        0, // r, g, b
        0,
        0,
        1,
      ], // r, g, b
      3
    ) // the size of the attribute

    .addAttribute(
      'aUvs', // the attribute name
      [
        0,
        0, // u, v
        1,
        0, // u, v
        1,
        1,
      ], // u, v
      2
    ); // the size of the attribute

  const vertexSrc = /*glsl*/ `
   #version 300 es
   precision mediump float;
   
   in vec2 aVertexPosition;
   in vec3 aColor;
   in vec2 aUvs;
   
   uniform mat3 translationMatrix;
   uniform mat3 projectionMatrix;
   
   out vec2 vUvs;
   out vec3 vColor;
   
   void main() {
     vUvs = aUvs;
     vColor = aColor;
     gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
     
    }`;

  const fragmentSrc = /*glsl*/ `
    #version 300 es
    precision mediump float;

    in vec3 vColor;
    in vec2 vUvs;

    uniform sampler2D uSampler2;

    out vec4 col;

    void main() {
        col = texture(uSampler2, vUvs) * vec4(vColor, 1.0);
    }`;

  const uniforms = {
    uSampler2: PIXI.Texture.from(goku),
  };

  const shader = PIXI.Shader.from(vertexSrc, fragmentSrc, uniforms);

  const triangle = new PIXI.Mesh(geometry, shader);

  triangle.position.set(400, 300);
  triangle.scale.set(2);

  app.stage.addChild(triangle);

  app.ticker.add((delta) => {
    triangle.rotation += 0.01;
  });

  return () => app.destroy();
}
