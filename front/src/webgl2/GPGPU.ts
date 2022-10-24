import {
  createProgram,
  makeBuffer,
  makeBufferAndSetAttribute,
  readBuffer,
} from './myUtils';

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

export function make(gl: WebGL2RenderingContext) {
  const program = createProgram(gl, { fs, vs });
  gl.transformFeedbackVaryings(
    program,
    ['sum', 'difference', 'product'],
    gl.SEPARATE_ATTRIBS
  );
  gl.linkProgram(program);

  const aLoc = gl.getAttribLocation(program, 'a');
  const bLoc = gl.getAttribLocation(program, 'b');

  // Create a vertex array object (attribute state)
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const a = [1, 2, 3, 4, 5, 6];
  const b = [3, 6, 9, 12, 15, 18];

  // put data in buffers
  const aBuffer = makeBufferAndSetAttribute(gl, { data: new Float32Array(a), loc: aLoc });
  const bBuffer = makeBufferAndSetAttribute(gl, { data: new Float32Array(b), loc: bLoc });

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

  const result = {
    sum: readBuffer(gl, sumBuffer, a.length * 4),
    diff: readBuffer(gl, differenceBuffer, a.length * 4),
    prod: readBuffer(gl, productBuffer, a.length * 4),
  };
  console.log(result);
}
