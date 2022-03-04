import { createProgram } from './hello';
import { mat3 } from 'gl-matrix';

export function main() {
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  const gl = canvas.getContext('webgl2');
  if (!gl) {
    return;
  }

  const program = createProgram(gl, vs, fs);

  // look up where the vertex data needs to go.
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const colorLocation = gl.getAttribLocation(program, 'a_color');

  const matrixLocation = gl.getUniformLocation(program, 'u_matrix')!;

  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);

  // Create a buffer for the positons.
  setLocations(gl, positionLocation);
  // Create a buffer for the colors.
  setColors(gl);

  // tell the color attribute how to pull data out of the current ARRAY_BUFFER
  gl.enableVertexAttribArray(colorLocation);
  const size = 4;
  const type = gl.UNSIGNED_BYTE;
  const normalize = true;
  const stride = 0;
  const offset = 0;
  gl.vertexAttribPointer(colorLocation, size, type, normalize, stride, offset);

  drawScene({ gl, vao, program, matrixLocation });
}

interface SceneArgs {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  vao: WebGLVertexArrayObject;
  matrixLocation: WebGLUniformLocation;
}

function setLocations(gl: WebGL2RenderingContext, positionLocation: number) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  // Set Geometry.
  setGeometry(gl);

  // tell the position attribute how to pull data out of the current ARRAY_BUFFER
  gl.enableVertexAttribArray(positionLocation);
  const size = 2;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);
  return { buffer, size, type, normalize, stride, offset };
}

function drawScene({ gl, program, vao, matrixLocation }: SceneArgs) {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao);

  const matrix = mat3.create();
  mat3.projection(matrix, gl.canvas.clientWidth, gl.canvas.clientHeight);
  // matrix = m3.translate(matrix, translation[0], translation[1]);
  // matrix = m3.rotate(matrix, angleInRadians);
  // matrix = m3.scale(matrix, scale[0], scale[1]);
  gl.uniformMatrix3fv(matrixLocation, false, matrix);

  // Draw the geometry.
  const offset = 0;
  const count = 6;
  gl.drawArrays(gl.TRIANGLES, offset, count);
}

// Fill the current buffer with the values that define a rectangle.
function setGeometry(gl: WebGL2RenderingContext) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-150, -100, 150, -100, -150, 100, 150, -100, -150, 100, 150, 100]),
    gl.STATIC_DRAW
  );
}

// Fill the current buffer with colors for the 2 triangles
// that make the rectangle.
function setColors(gl: WebGL2RenderingContext) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  // Pick 2 random colors.
  const r1 = Math.random() * 256; // 0 to 255.99999
  const b1 = Math.random() * 256; // these values
  const g1 = Math.random() * 256; // will be truncated
  const r2 = Math.random() * 256; // when stored in the
  const b2 = Math.random() * 256; // Uint8Array
  const g2 = Math.random() * 256;

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Uint8Array([
      // Uint8Array
      r1,
      b1,
      g1,
      255,
      r1,
      b1,
      g1,
      255,
      r1,
      b1,
      g1,
      255,
      r2,
      b2,
      g2,
      255,
      r2,
      b2,
      g2,
      255,
      r2,
      b2,
      g2,
      255,
    ]),
    gl.STATIC_DRAW
  );
}

const vs = `#version 300 es

in vec2 a_position;
in vec4 a_color;

uniform mat3 u_matrix;

out vec4 v_color;

void main() {
  // Multiply the position by the matrix.
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);

  // Copy the color from the attribute to the varying.
  v_color = a_color;
}
`;

const fs = `#version 300 es

precision highp float;

in vec4 v_color;

out vec4 outColor;

void main() {
  outColor = v_color;
}
`;
