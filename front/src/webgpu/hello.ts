import { animationFrames, combineLatest, fromEvent, startWith } from 'rxjs';

let i = 0;
const params = new URLSearchParams(location.search);
function parameter(name: string, def: number) {
  if (!params.has(name)) return def;
  return parseFloat(params.get(name)!);
}

export async function start(ctx: CanvasRenderingContext2D) {
  const NUM_BALLS = parameter('balls', 100);
  const BUFFER_SIZE = NUM_BALLS * 6 * Float32Array.BYTES_PER_ELEMENT;
  const minRadius = parameter('min_radius', 2);
  const maxRadius = parameter('max_radius', 10);
  const render = parameter('render', 1);

  ctx.canvas.width = parameter('width', 1000);
  ctx.canvas.height = parameter('height', 800);

  function fatal(msg: string): never {
    document.body.innerHTML = `<pre>${msg}</pre>`;
    throw Error(msg);
  }

  if (!('gpu' in navigator))
    fatal(
      'WebGPU not supported. Please enable it in about:flags in Chrome or in about:config in Firefox.'
    );

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) fatal('Couldn’t request WebGPU adapter.');

  const device = await adapter.requestDevice();
  if (!device) fatal('Couldn’t request WebGPU device.');

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
    ],
  });

  function raf() {
    return new Promise((resolve) => requestAnimationFrame(resolve));
  }

  let inputBalls = new Float32Array(new ArrayBuffer(BUFFER_SIZE));
  for (let i = 0; i < NUM_BALLS; i++) {
    inputBalls[i * 6 + 0] = random(minRadius, maxRadius);
    inputBalls[i * 6 + 2] = random(0, ctx.canvas.width);
    inputBalls[i * 6 + 3] = random(0, ctx.canvas.height);
    inputBalls[i * 6 + 4] = random(-100, 100);
    inputBalls[i * 6 + 5] = random(-100, 100);
  }

  device.queue.writeBuffer(
    scene,
    0,
    new Float32Array([ctx.canvas.width, ctx.canvas.height])
  );

  device.queue.writeBuffer(input, 0, inputBalls);
  const mousePos = new Float32Array([300, 300]);

  ctx.canvas.addEventListener('mousemove', (event) => {
    mousePos[0] = event.offsetX;
    mousePos[1] = 800 - event.offsetY;
    // console.log(mousePos);
  });
  while (true) {
    performance.mark('webgpu start');
    device.queue.writeBuffer(mouseBuffer, 0, mousePos);
    const commandEncoder = device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, bindGroup);
    const dispatchSize = Math.ceil(NUM_BALLS / 64);
    passEncoder.dispatchWorkgroups(dispatchSize);
    passEncoder.end();
    commandEncoder.copyBufferToBuffer(output, 0, stagingBuffer, 0, BUFFER_SIZE);
    commandEncoder.copyBufferToBuffer(output, 0, input, 0, BUFFER_SIZE);
    const commands = commandEncoder.finish();
    device.queue.submit([commands]);

    await stagingBuffer.mapAsync(GPUMapMode.READ, 0, BUFFER_SIZE);
    const copyArrayBuffer = stagingBuffer.getMappedRange(0, BUFFER_SIZE);
    const data = copyArrayBuffer.slice(0);
    const outputBalls = new Float32Array(data);
    stagingBuffer.unmap();

    performance.mark('webgpu end');
    performance.measure('webgpu', 'webgpu start', 'webgpu end');

    if (render !== 0) {
      drawScene(outputBalls, ctx);
    } else {
      i++;
      ctx.fillStyle = i % 2 == 0 ? 'red' : 'blue';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    await raf();
  }
}

function drawScene(balls: Float32Array, ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.scale(1, -1);
  ctx.translate(0, -ctx.canvas.height);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = 'red';
  for (let i = 0; i < balls.length; i += 6) {
    const r = balls[i + 0];
    const px = balls[i + 2];
    const py = balls[i + 3];
    const vx = balls[i + 4];
    const vy = balls[i + 5];
    let angle = Math.atan(vy / (vx === 0 ? Number.EPSILON : vx));
    // Correct for Math.atan() assuming the angle is [-PI/2;PI/2].
    if (vx < 0) angle += Math.PI;
    const ex = px + Math.cos(angle) * Math.sqrt(2) * r;
    const ey = py + Math.sin(angle) * Math.sqrt(2) * r;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, 2 * Math.PI, true);
    ctx.moveTo(ex, ey);
    ctx.arc(px, py, r, angle - Math.PI / 4, angle + Math.PI / 4, true);
    ctx.lineTo(ex, ey);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function random(a: number, b: number) {
  return Math.random() * (b - a) + a;
}

const computeCode = /*wgsl*/ `
    struct Ball {
      radius: f32,
      position: vec2<f32>,
      velocity: vec2<f32>,
    };

    @group(0) @binding(0)
    var<storage, read> input: array<Ball>;

    @group(0) @binding(1)
    var<storage, read_write> output: array<Ball>;

    struct Scene {
      width: f32,
      height: f32,
    };

    @group(0) @binding(2)
    var<storage, read> scene: Scene;

    @group(0) @binding(3)
    var<uniform> mouse: vec2<f32>;

    const PI: f32 = 3.14159;
    const TIME_STEP: f32 = 0.016;
    const G: f32 = 1000000.0;

    fn calcForce(src_ball: Ball, other_ball: Ball, min_dist: f32)-> vec2<f32>{
      let other_mass = pow(other_ball.radius, 2.0) * PI;
      let src_mass = pow(src_ball.radius, 2.0) * PI;
      let dist = src_ball.position - other_ball.position;
      return  other_mass*dist  / pow(max(length(dist), min_dist), 3.0);
    }

    @compute @workgroup_size(64)
    fn main(
      @builtin(global_invocation_id)
      global_id : vec3<u32>,
    ) {
      let num_balls = arrayLength(&output);
      if(global_id.x >= num_balls) {
        return;
      }
      var src_ball = input[global_id.x];
      let src_mass = pow(src_ball.radius, 2.0) * PI;
      let dst_ball = &output[global_id.x];
      let mouse_ball = Ball(50.0, mouse, vec2(100, 100));
      var gravity = -calcForce(src_ball, mouse_ball, 60.0);

      (*dst_ball) = src_ball;

      // Ball/Ball collision
      for(var i = 0u; i < num_balls; i = i + 1u) {
        if(i == global_id.x) {
          continue;
        }
        let other_ball = input[i];
        //gravity calc
        gravity += calcForce(src_ball, other_ball, 10.0);
      }

      // Apply velocity
      gravity*=G;
      let damping_factor = -(*dst_ball).velocity*1000;
      gravity+=damping_factor;
      (*dst_ball).velocity += gravity/src_mass*TIME_STEP;
      (*dst_ball).position = (*dst_ball).position + (*dst_ball).velocity * TIME_STEP;

      // Ball/Wall collision
      if((*dst_ball).position.x - (*dst_ball).radius < 0.) {
        (*dst_ball).position.x = (*dst_ball).radius;
        (*dst_ball).velocity.x = -(*dst_ball).velocity.x;
      }
      if((*dst_ball).position.y - (*dst_ball).radius < 0.) {
        (*dst_ball).position.y = (*dst_ball).radius;
        (*dst_ball).velocity.y = -(*dst_ball).velocity.y;
      }
      if((*dst_ball).position.x + (*dst_ball).radius >= scene.width) {
        (*dst_ball).position.x = scene.width - (*dst_ball).radius;
        (*dst_ball).velocity.x = -(*dst_ball).velocity.x;
      }
      if((*dst_ball).position.y + (*dst_ball).radius >= scene.height) {
        (*dst_ball).position.y = scene.height - (*dst_ball).radius;
        (*dst_ball).velocity.y = -(*dst_ball).velocity.y;
      }
    }
  `;
