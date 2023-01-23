import { animationFrames } from 'rxjs';

export const webgpuTriangle = async (canvas: HTMLCanvasElement) => {
  const { device, presentationFormat, context } = await initDevice(canvas);
  const pipeline = createPipeline(device, presentationFormat);
  const sub = animationFrames().subscribe(() => {
    draw(device, context, pipeline);
  });
  return () => sub.unsubscribe();
};

const triangleVertWGSL = /*wgsl*/ `
@vertex
fn main(
  @builtin(vertex_index) VertexIndex : u32,
  @location(0) pos: vec3<f32>
) -> @builtin(position) vec4<f32> {
  return vec4<f32>(pos, 1.0);
}
`;

const redFragWGSL = /*wgsl*/ `
@group(0) @binding(0) var<uniform> color: vec4<f32>;
@fragment
fn main() -> @location(0) vec4<f32> {
  return color;
}
`;

function draw(device: GPUDevice, context: GPUCanvasContext, pipeData: PipelineData) {
  const commandEncoder = device.createCommandEncoder();
  const textureView = context.getCurrentTexture().createView();
  const renderPassDescriptor: GPURenderPassDescriptor = {
    colorAttachments: [
      {
        view: textureView,
        clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
        loadOp: 'clear',
        storeOp: 'store',
      },
    ],
  };
  const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
  // device.queue.writeBuffer(
  //   pipeData.colorBuffer,
  //   0,
  //   new Float32Array([1, Math.sin(((Date.now() % 10_000) / 10_000) * 2 * Math.PI), 0, 1])
  // );
  passEncoder.setPipeline(pipeData.pipeline);
  passEncoder.setVertexBuffer(0, pipeData.vertexBuffer);
  passEncoder.setBindGroup(0, pipeData.group);
  passEncoder.draw(4, 1, 0, 0);
  passEncoder.end();
  device.queue.submit([commandEncoder.finish()]);
}

interface PipelineData {
  vertexBuffer: GPUBuffer;
  pipeline: GPURenderPipeline;
  group: GPUBindGroup;
  colorBuffer: GPUBuffer;
}

function createPipeline(
  device: GPUDevice,
  presentationFormat: GPUTextureFormat
): PipelineData {
  const vertex = new Float32Array(
    [
      [-0.5, -0.5, 0],
      [-0.5, 0.5, 0],
      [0.5, -0.5, 0],
      [0.5, 0.5, 0],
    ].flat()
  );

  const vertexBuffer = device.createBuffer({
    size: vertex.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(vertexBuffer, 0, vertex);

  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: device.createShaderModule({
        code: triangleVertWGSL,
      }),
      entryPoint: 'main',
      buffers: [
        {
          arrayStride: 3 * 4,
          attributes: [
            {
              format: 'float32x3',
              offset: 0,
              shaderLocation: 0,
            },
          ],
        },
      ],
    },
    fragment: {
      module: device.createShaderModule({
        code: redFragWGSL,
      }),
      entryPoint: 'main',
      targets: [
        {
          format: presentationFormat,
        },
      ],
    },
    primitive: {
      topology: 'triangle-strip',
    },
  });

  const colorBuffer = device.createBuffer({
    size: 4 * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const group = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: colorBuffer } }],
  });

  return { pipeline, vertexBuffer, group, colorBuffer };
}

async function initDevice(canvas: HTMLCanvasElement) {
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter!.requestDevice();

  const context = canvas.getContext('webgpu') as GPUCanvasContext;

  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format: presentationFormat,
    alphaMode: 'opaque',
  });
  return { device, presentationFormat, context };
}
