const histElements = 10_000_000;
const bucketSize = 10;
const maxElement = 1000;
const workGroups = 100;
const numOfBuckets = maxElement / bucketSize;

export async function makeHistogram(canvas: HTMLCanvasElement) {
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter?.requestDevice()!;

  const module = device.createShaderModule({
    code: computeShader,
  });

  const pipeline = device.createComputePipeline({
    layout: 'auto',
    compute: {
      entryPoint: 'main',
      module,
    },
  });

  const dataSource = device.createBuffer({
    size: histElements * 4,
    usage: GPUBufferUsage.STORAGE,
    mappedAtCreation: true,
  });

  fillBuffer(dataSource);
  dataSource.unmap();

  const buckets = device.createBuffer({
    size: numOfBuckets * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });
  const bucketRead = device.createBuffer({
    size: numOfBuckets * 4,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });

  const group = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: dataSource,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: buckets,
        },
      },
    ],
  });

  const command = device.createCommandEncoder();
  const pass = command.beginComputePass();
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, group);
  pass.dispatchWorkgroups(histElements / workGroups ** 2);
  pass.end();
  command.copyBufferToBuffer(buckets, 0, bucketRead, 0, numOfBuckets * 4);
  device.queue.submit([command.finish()]);
  await device.queue.onSubmittedWorkDone();

  await bucketRead.mapAsync(GPUMapMode.READ);
  console.log(new Uint32Array(bucketRead.getMappedRange()));
}

function fillBuffer(dataSource: GPUBuffer) {
  const data = new Uint32Array(dataSource.getMappedRange());
  data.forEach((_, index) => {
    data[index] = Math.random() * maxElement;
  });
}

const computeShader = /*wgsl*/ `

@group(0) @binding(0) var<storage> data: array<u32>;
@group(0) @binding(1) var<storage, read_write> buckets: array<atomic<u32>>;


@compute @workgroup_size(${workGroups})
fn main(
  @builtin(global_invocation_id) global_id : vec3<u32>
  ){
    for(var i = 0u; i<100; i+=1u){
      let index = data[global_id.x*100+i]/${bucketSize};
      atomicAdd(&buckets[index], 1);
    }
}
`;
