import { range } from 'ramda';
import * as twgl from 'twgl.js';

export function main(gl: WebGL2RenderingContext) {
  // shaders to generate a mesh

  const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
    position: 12,
    enter: new Float32Array(range(0, 12)),
  });
  const feedbackProgramInfo = twgl.createProgramInfo(gl, [tfvs, tfFs], {
    // note: you can pass a bufferInfo instead of this array
    transformFeedbackVaryings: ['position'],
  });
  console.log(bufferInfo);
  const tf = twgl.createTransformFeedback(gl, feedbackProgramInfo, bufferInfo);
  gl.enable(gl.RASTERIZER_DISCARD);

  gl.useProgram(feedbackProgramInfo.program);
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
  gl.beginTransformFeedback(gl.TRIANGLES);
  twgl.setUniforms(feedbackProgramInfo, {});
  twgl.drawBufferInfo(gl, bufferInfo);
  gl.endTransformFeedback();
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
  const { buffer, numComponents } = bufferInfo.attribs!.position;
  const result = new Float32Array(bufferInfo.numElements * numComponents!);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.getBufferSubData(gl.ARRAY_BUFFER, 0, result);
  gl.disable(gl.RASTERIZER_DISCARD);
  console.log(result);
}

const tfvs = /*glsl*/ `
#version 300 es

in vec3 enter;
out vec3 position;

void main() {
  float sum = enter[0] + enter[1] + enter[2];
  position = vec3(sum, sum, 22.22);
}`;

const tfFs = `
#version 300 es
precision mediump float;
out vec4 o;
void main() {
  o = vec4(0);
}`;
