import { computeCode, renderShaders } from './shaders';

const rectData = new Float32Array(
  [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ]
    .flat()
    .map((item) => item / 100)
);

export function drawBalls(
  {
    commandEncoder,
    context,
    pipeData,
  }: {
    commandEncoder: GPUCommandEncoder;
    context: GPUCanvasContext;
    pipeData: PipelineData;
  },
  drawData: { vertexData: GPUBuffer; elements: number }
) {
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
  passEncoder.setVertexBuffer(0, pipeData.vertex);
  passEncoder.setBindGroup(0, pipeData.bindGroup);
  passEncoder.draw(4, drawData.elements, 0, 0);
  // passEncoder.draw(3, 1, 0, 0);
  passEncoder.end();
}

interface PipelineData {
  pipeline: GPURenderPipeline;
  vertex: GPUBuffer;
  bindGroup: GPUBindGroup;
}

export function createDrawPipeline(
  device: GPUDevice,
  presentationFormat: GPUTextureFormat,
  positionsBuffer: GPUBuffer
): PipelineData {
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: device.createShaderModule({
        code: renderShaders,
      }),
      entryPoint: 'mainVert',
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
        code: renderShaders,
      }),
      entryPoint: 'mainFrag',
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

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: positionsBuffer } }],
  });

  const vertex = device.createBuffer({
    size: rectData.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });
  new Float32Array(vertex.getMappedRange()).set(rectData);
  vertex.unmap();
  return { pipeline, vertex, bindGroup };
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
    usage: GPUBufferUsage.STORAGE,
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
