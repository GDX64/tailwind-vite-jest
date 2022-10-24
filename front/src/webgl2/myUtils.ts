function createShader(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader)!);
  }
  return shader;
}

export function createProgram(gl: WebGL2RenderingContext, { vs = '', fs = '' }) {
  const vShader = createShader(gl, gl.VERTEX_SHADER, vs);
  const fShader = createShader(gl, gl.FRAGMENT_SHADER, fs);

  const program = gl.createProgram()!;
  gl.attachShader(program, vShader);
  gl.attachShader(program, fShader);
  return program;
}

export function makeBuffer(
  gl: WebGL2RenderingContext,
  sizeOrData: number | ArrayBufferLike
) {
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  if (typeof sizeOrData === 'number') {
    gl.bufferData(gl.ARRAY_BUFFER, sizeOrData, gl.STATIC_DRAW);
  } else {
    gl.bufferData(gl.ARRAY_BUFFER, sizeOrData, gl.STATIC_DRAW);
  }
  return buf;
}

export function makeBufferAndSetAttribute(
  gl: WebGL2RenderingContext,
  {
    data = 3 as number | ArrayBufferLike,
    loc = 0,
    type = gl.FLOAT,
    normalize = false,
    size = 1,
  }
) {
  const buf = makeBuffer(gl, data);
  // setup our attributes to tell WebGL how to pull
  // the data from the buffer above to the attribute
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(
    loc,
    size, // size (num components)
    type, // type of data in buffer
    normalize, // normalize
    0, // stride (0 = auto)
    0 // offset
  );
  return buf;
}

export function readBuffer(
  gl: WebGL2RenderingContext,
  buffer: WebGLBuffer | null,
  size: number
) {
  const results = new Uint8Array(size);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.getBufferSubData(
    gl.ARRAY_BUFFER,
    0, // byte offset into GPU buffer,
    results
  );
  return results;
}
