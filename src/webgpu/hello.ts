export async function test() {
  if (!navigator.gpu) throw Error('WebGPU not supported.');

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw Error('Couldn’t request WebGPU adapter.');

  const device = await adapter.requestDevice();
  if (!device) throw Error('Couldn’t request WebGPU logical device.');

  const module = device.createShaderModule({
    code: `
      @stage(compute) @workgroup_size(64)
      fn main() {
        // Pointless!
      }
    `,
  });

  const pipeline = device.createComputePipeline({
    compute: {
      module,
      entryPoint: 'main',
    },
  });
}
