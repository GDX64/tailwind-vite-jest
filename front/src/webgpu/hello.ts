import { animationFrames, combineLatest, fromEvent, startWith } from 'rxjs';
import {
  createComputePipeline,
  createDrawPipeline,
  drawBalls,
  initDevice,
} from './ballsDraw';
import { workGroupSize } from './ComputeShader';

let i = 0;
const params = new URLSearchParams(location.search);
function parameter(name: string, def: number) {
  if (!params.has(name)) return def;
  return parseFloat(params.get(name)!);
}

export async function start(canvas: HTMLCanvasElement) {
  const NUM_BALLS = parameter('balls', 100);
  const BUFFER_SIZE = NUM_BALLS * 6 * Float32Array.BYTES_PER_ELEMENT;
  const VERTEX_SIZE = NUM_BALLS * 2 * Float32Array.BYTES_PER_ELEMENT;

  const minRadius = parameter('min_radius', 2);
  const maxRadius = parameter('max_radius', 2);
  // const render = parameter('render', 1);

  canvas.width = parameter('width', 1000);
  canvas.height = parameter('height', 1000);

  const { device, context, presentationFormat } = await initDevice(canvas);
  const pipelineData = createDrawPipeline(device, presentationFormat, VERTEX_SIZE);
  const {
    scene,
    input,
    mouseBuffer,
    pipeline,
    bindGroup,
    output,
    stagingBuffer,
    vertexData,
  } = createComputePipeline(device, BUFFER_SIZE, VERTEX_SIZE);

  function raf() {
    return new Promise((resolve) => requestAnimationFrame(resolve));
  }

  let inputBalls = new Float32Array(new ArrayBuffer(BUFFER_SIZE));
  for (let i = 0; i < NUM_BALLS; i++) {
    inputBalls[i * 6 + 0] = random(minRadius, maxRadius);
    inputBalls[i * 6 + 2] = random(0, canvas.width);
    inputBalls[i * 6 + 3] = random(0, canvas.height);
    inputBalls[i * 6 + 4] = random(-100, 100);
    inputBalls[i * 6 + 5] = random(-100, 100);
  }

  device.queue.writeBuffer(scene, 0, new Float32Array([canvas.width, canvas.height]));

  device.queue.writeBuffer(input, 0, inputBalls);
  const mousePos = new Float32Array([300, 300]);

  canvas.addEventListener('mousemove', (event) => {
    mousePos[0] = event.offsetX;
    mousePos[1] = canvas.height - event.offsetY;
    // console.log(mousePos);
  });
  while (true) {
    performance.mark('webgpu start');
    device.queue.writeBuffer(mouseBuffer, 0, mousePos);
    const commandEncoder = device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, bindGroup);
    const dispatchSize = Math.ceil(NUM_BALLS / workGroupSize);
    passEncoder.dispatchWorkgroups(dispatchSize);
    passEncoder.end();
    commandEncoder.copyBufferToBuffer(output, 0, stagingBuffer, 0, BUFFER_SIZE);
    commandEncoder.copyBufferToBuffer(output, 0, input, 0, BUFFER_SIZE);
    const commands = commandEncoder.finish();
    device.queue.submit([commands]);
    await device.queue.onSubmittedWorkDone();
    await drawBalls(device, context, pipelineData, { vertexData, elements: NUM_BALLS });
    // await stagingBuffer.mapAsync(GPUMapMode.READ, 0, BUFFER_SIZE);
    // const copyArrayBuffer = stagingBuffer.getMappedRange(0, BUFFER_SIZE);
    // const data = copyArrayBuffer.slice(0);
    // const outputBalls = new Float32Array(data);
    // stagingBuffer.unmap();

    performance.mark('webgpu end');
    const result = performance.measure('webgpu', 'webgpu start', 'webgpu end');
    // console.log(result.duration);
    await raf();
  }
}

function drawScene(balls: Float32Array, ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.scale(1, -1);
  ctx.translate(0, -ctx.canvas.height);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = 'red';
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  for (let i = 0; i < balls.length; i += 6) {
    const r = balls[i + 0];
    const px = balls[i + 2];
    const py = balls[i + 3];
    const vx = balls[i + 4];
    const vy = balls[i + 5];
    let angle = Math.atan(vy / (vx === 0 ? Number.EPSILON : vx));
    // Correct for Math.atan() assuming the angle is [-PI/2;PI/2].
    if (vx < 0) angle += Math.PI;
    // const ex = px + Math.cos(angle) * Math.sqrt(2) * r;
    // const ey = py + Math.sin(angle) * Math.sqrt(2) * r;
    // ctx.arc(px, py, r, 0, 2 * Math.PI, true);
    // ctx.moveTo(ex, ey);
    // ctx.arc(px, py, r, angle - Math.PI / 4, angle + Math.PI / 4, true);
    // ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.rect(px - r, py - r, r * 2, r * 2);
    // ctx.lineTo(ex, ey);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function random(a: number, b: number) {
  return Math.random() * (b - a) + a;
}
