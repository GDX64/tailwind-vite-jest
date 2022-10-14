'use strict';

const vs = `#version 300 es

in float a;
in float b;
out float sum;
out float difference;
out float product;

void main() {
  sum = a + b;
  difference = a - b;
  product = a * b;
}
`;

const fs = `#version 300 es
precision highp float;
void main() {
}
`;

function createShader(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader)!);
  }
  return shader;
}

function makeBuffer(gl: WebGL2RenderingContext, sizeOrData: number | Float32Array) {
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, sizeOrData as any, gl.STATIC_DRAW);
  return buf;
}

function makeBufferAndSetAttribute(
  gl: WebGL2RenderingContext,
  data: number | Float32Array,
  loc: number
) {
  const buf = makeBuffer(gl, data);
  // setup our attributes to tell WebGL how to pull
  // the data from the buffer above to the attribute
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(
    loc,
    1, // size (num components)
    gl.FLOAT, // type of data in buffer
    false, // normalize
    0, // stride (0 = auto)
    0 // offset
  );
}

export function make(gl: WebGL2RenderingContext) {
  const vShader = createShader(gl, gl.VERTEX_SHADER, vs);
  const fShader = createShader(gl, gl.FRAGMENT_SHADER, fs);

  const program = gl.createProgram()!;
  gl.attachShader(program, vShader);
  gl.attachShader(program, fShader);
  gl.transformFeedbackVaryings(
    program,
    ['sum', 'difference', 'product'],
    gl.SEPARATE_ATTRIBS
  );
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw Error('could not get the program');
  }

  const aLoc = gl.getAttribLocation(program, 'a');
  const bLoc = gl.getAttribLocation(program, 'b');

  // Create a vertex array object (attribute state)
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const a = [1, 2, 3, 4, 5, 6];
  const b = [3, 6, 9, 12, 15, 18];

  // put data in buffers
  const aBuffer = makeBufferAndSetAttribute(gl, new Float32Array(a), aLoc);
  const bBuffer = makeBufferAndSetAttribute(gl, new Float32Array(b), bLoc);

  // Create and fill out a transform feedback
  const tf = gl.createTransformFeedback();
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);

  // make buffers for output
  const sumBuffer = makeBuffer(gl, a.length * 4);
  const differenceBuffer = makeBuffer(gl, a.length * 4);
  const productBuffer = makeBuffer(gl, a.length * 4);

  // bind the buffers to the transform feedback
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, sumBuffer);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, differenceBuffer);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 2, productBuffer);

  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

  // buffer's we are writing to can not be bound else where
  gl.bindBuffer(gl.ARRAY_BUFFER, null); // productBuffer was still bound to ARRAY_BUFFER so unbind it

  // above this line is setup
  // ---------------------------------
  // below this line is "render" time

  gl.useProgram(program);

  // bind our input attribute state for the a and b buffers
  gl.bindVertexArray(vao);

  // no need to call the fragment shader
  gl.enable(gl.RASTERIZER_DISCARD);

  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
  gl.beginTransformFeedback(gl.POINTS);
  gl.drawArrays(gl.POINTS, 0, a.length);
  gl.endTransformFeedback();
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

  // turn on using fragment shaders again
  gl.disable(gl.RASTERIZER_DISCARD);

  log(`a: ${a}`);
  log(`b: ${b}`);

  printResults(gl, sumBuffer, 'sums');
  printResults(gl, differenceBuffer, 'differences');
  printResults(gl, productBuffer, 'products');

  function printResults(
    gl: WebGL2RenderingContext,
    buffer: WebGLBuffer | null,
    label: string
  ) {
    const results = new Float32Array(a.length);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.getBufferSubData(
      gl.ARRAY_BUFFER,
      0, // byte offset into GPU buffer,
      results
    );
    // print the results
    log(`${label}: ${results}`);
  }
}

function log(...args: any[]) {
  console.log(...args);
}
