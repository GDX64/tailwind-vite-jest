import * as PIXI from 'pixi.js';

function squareArr(x: number, y: number, w: number, h: number) {
  const first = [x, y];
  const sec = [x, y + h];
  const third = [x + w, y];
  const fourth = [x + w, y + h];
  return [...first, ...sec, ...third, ...sec, ...third, ...fourth];
}

function randomRects(n: number) {
  const rand = (n: number) => Math.round(Math.random() * n - n / 2);
  return [...Array(n)].flatMap(() =>
    squareArr(rand(500), rand(500), rand(200), rand(200))
  );
}

function randomColorsForRect(n: number) {
  const randByte = () => Math.floor(Math.random() * 256);
  return [...Array(n)].flatMap(() => {
    const color = randByte() | (randByte() << 8) | (randByte() << 16);
    return [color, color, color, color, color, color];
  });
}

export function shadersTest(el: HTMLCanvasElement, resolution: number) {
  const app = new PIXI.Application({ view: el, resolution, height: 500, width: 500 });
  const n = 10;
  const geometry = new PIXI.Geometry()
    .addAttribute('aVertexPosition', randomRects(n), 2, false, PIXI.TYPES.FLOAT)
    .addAttribute('aColor', randomColorsForRect(n), 1);

  const shader = PIXI.Shader.from(
    /*GLSL*/ `
    #version 300 es
    precision mediump float;
    in vec2 aVertexPosition;
    in float aColor;
    out float vColor;
    uniform vec2 scale;
    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    void main() {
      vec4 final = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
      gl_Position = vec4(final.x+scale.x, final.y+scale.y, 0.0, 1.0);
      vColor = aColor;
    } 
      `,

    /*GLSL*/ `
      #version 300 es
      precision mediump float;
      in float vColor;
      out vec4 col;

      float toColor(float base, int shift){
        return mod(float(int(base) >> shift), 255.0)/255.0;
        // return 1.0;
      }

      void main() {
          col = vec4(toColor(vColor, 0), toColor(vColor, 8), toColor(vColor, 16), 1.0);
      }
  
  `,
    { scale: [0, 0] }
  );

  const triangle = new PIXI.Mesh(geometry, shader, undefined, PIXI.DRAW_MODES.TRIANGLES);

  triangle.position.set(100, 100);
  const filter = new PIXI.filters.FXAAFilter();
  filter.resolution = 20;
  triangle.filters = [filter];
  triangle.scale.y = 1;
  app.stage.addChild(triangle);
  console.log(triangle.getBounds());

  shader.uniforms.scale = [0, 0];
  app.ticker.add((delta) => {
    // triangle.rotation += 0.01;
  });
  return () => {
    app.destroy();
  };
}
