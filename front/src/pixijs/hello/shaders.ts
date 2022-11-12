import * as PIXI from 'pixi.js';

export function shadersTest(el: HTMLCanvasElement, resolution: number) {
  const app = new PIXI.Application({ view: el, resolution, height: 500, width: 500 });

  const geometry = new PIXI.Geometry().addAttribute(
    'aVertexPosition',
    [-100, -50, 100, -50, 0, 100]
  );

  const shader = PIXI.Shader.from(
    /*GLSL*/ `
    precision mediump float;
    attribute vec2 aVertexPosition;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    void main() {
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    } 
      `,

    /*GLSL*/ `precision mediump float;
  
      void main() {
          gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      }
  
  `
  );

  const triangle = new PIXI.Mesh(geometry, shader);

  triangle.position.set(400, 300);
  const filter = new PIXI.filters.FXAAFilter();
  filter.resolution = 20;
  triangle.filters = [filter];

  app.stage.addChild(triangle);

  app.ticker.add((delta) => {
    triangle.rotation += 0.01;
  });
  return () => {
    app.destroy();
  };
}
