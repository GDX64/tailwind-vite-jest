import { computeCode } from './ComputeShader';

const triangleVertWGSL = /*wgsl*/ `
@vertex
fn main(
  @builtin(vertex_index) VertexIndex : u32,
  @location(0) pos: vec3<f32>
) -> @builtin(position) vec4<f32> {
  let norm_pos = pos/500.0;
  return vec4<f32>(norm_pos.x-1, norm_pos.y-1, 0.0, 1.0);
}
`;

const redFragWGSL = /*wgsl*/ `
@fragment
fn main() -> @location(0) vec4<f32> {
  return vec4(1.0, 0.0, 0.0, 1.0);
}
`;

export function drawBalls(
  device: GPUDevice,
  context: GPUCanvasContext,
  pipeData: PipelineData,
  drawData: { vertexData: GPUBuffer; elements: number }
) {
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
  passEncoder.setPipeline(pipeData.pipeline);
  passEncoder.setVertexBuffer(0, drawData.vertexData);
  passEncoder.draw(drawData.elements, 1, 0, 0);
  passEncoder.end();
  device.queue.submit([commandEncoder.finish()]);
  return device.queue.onSubmittedWorkDone();
}

interface PipelineData {
  pipeline: GPURenderPipeline;
}

export function createDrawPipeline(
  device: GPUDevice,
  presentationFormat: GPUTextureFormat
): PipelineData {
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: device.createShaderModule({
        code: triangleVertWGSL,
      }),
      entryPoint: 'main',
      buffers: [
        {
          arrayStride: 2 * 4,
          attributes: [
            {
              format: 'float32x2',
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
      topology: 'point-list',
    },
  });

  return { pipeline };
}

export async function initDevice(canvas: HTMLCanvasElement) {
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

export function createComputePipeline(
  device: GPUDevice,
  BUFFER_SIZE: number,
  VERTEX_SIZE: number
) {
  const module = device.createShaderModule({ code: computeCode });

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: 'read-only-storage',
        },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: 'storage',
        },
      },
      {
        binding: 2,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: 'read-only-storage',
        },
      },
      {
        binding: 3,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: 'uniform',
        },
      },
      {
        binding: 4,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: 'storage',
        },
      },
    ],
  });

  const pipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    }),
    compute: {
      module,
      entryPoint: 'main',
    },
  });

  const scene = device.createBuffer({
    size: 2 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const input = device.createBuffer({
    size: BUFFER_SIZE,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const output = device.createBuffer({
    size: BUFFER_SIZE,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  const stagingBuffer = device.createBuffer({
    size: BUFFER_SIZE,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });

  const mouseBuffer = device.createBuffer({
    size: 4 * 2,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const vertexData = device.createBuffer({
    size: VERTEX_SIZE,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE,
  });

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: input,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: output,
        },
      },
      {
        binding: 2,
        resource: {
          buffer: scene,
        },
      },
      {
        binding: 3,
        resource: {
          buffer: mouseBuffer,
        },
      },
      {
        binding: 4,
        resource: {
          buffer: vertexData,
        },
      },
    ],
  });
  return {
    scene,
    input,
    mouseBuffer,
    pipeline,
    bindGroup,
    output,
    stagingBuffer,
    vertexData,
  };
}
