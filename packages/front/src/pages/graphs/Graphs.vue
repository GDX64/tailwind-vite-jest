<template>
  <canvas ref="canvas" class="h-full w-full min-h-screen"></canvas>
</template>

<script setup lang="ts">
import { vec2 } from 'gl-matrix';
import { useAnimationFrames, useCanvasDPI } from '../../utils/rxjsUtils';
import { nextTick, onMounted } from 'vue';
import { v8_0_0 } from 'pixi.js';

class ForceGraph {
  data: Map<number, GraphNode> = new Map();
  currentId = 0;

  evolve(delta: number) {
    const substeps = 10;
    for (let i = 0; i < substeps; i++) {
      this._evolve(delta);
    }
  }

  private _evolve(delta: number) {
    const cache1 = vec2.create();
    const cache2 = vec2.create();
    const cache3 = vec2.create();
    for (const node of this.data.values()) {
      for (const other of this.data.values()) {
        if (node === other) continue;
        const d = vec2.sub(cache1, other.pos, node.pos);
        const l = vec2.length(d);
        if (l < 0.001) continue;
        const hasConnection = node.edges.includes(other.id);
        if (hasConnection) {
          const attractionForce = vec2.scale(cache2, d, 0.1);
          vec2.scaleAndAdd(node.v, node.v, attractionForce, delta);
        }
        const repulsionBase = -10_000 * (node.edges.length + other.edges.length);
        const repulsionForce = vec2.scale(cache3, d, repulsionBase / (l * l * l));
        vec2.scaleAndAdd(node.v, node.v, repulsionForce, delta);
      }
      //damping
      vec2.scale(node.v, node.v, 0.97);
      vec2.scaleAndAdd(node.pos, node.pos, node.v, delta);
    }
  }

  add(node: GraphNode) {
    this.data.set(node.id, node);
  }

  addConnectionTo(from: number, to: number) {
    const fromNode = this.data.get(from);
    const toNode = this.data.get(to);
    if (!fromNode || !toNode) return;
    fromNode.edges.push(to);
    toNode.edges.push(from);
  }

  addRandom(height: number, width: number) {
    const id = this.currentId;
    this.currentId++;
    const rand = () => Math.floor(Math.random() ** 3 * this.currentId);

    const node: GraphNode = {
      id,
      pos: vec2.fromValues(Math.random() * width, Math.random() * height),
      edges: [],
      v: vec2.create(),
    };
    this.add(node);
    // const edge1 = Math.max(0, id - 1);
    // const edge2 = Math.max(0, id - 2);
    const edge1 = rand();
    const edge2 = rand();
    this.addConnectionTo(id, edge1);
    this.addConnectionTo(id, edge2);
  }

  center() {
    const center = vec2.create();
    for (const node of this.data.values()) {
      vec2.add(center, center, node.pos);
    }
    vec2.scale(center, center, 1 / this.data.size);
    return center;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = '#00000077';
    for (const node of this.data.values()) {
      for (const edge of node.edges) {
        const target = this.data.get(edge);
        if (target) {
          ctx.beginPath();
          ctx.moveTo(node.pos[0], node.pos[1]);
          ctx.lineTo(target.pos[0], target.pos[1]);
          ctx.stroke();
        }
      }
    }
    ctx.fillStyle = '#ff3030ff';
    for (const node of this.data.values()) {
      ctx.beginPath();
      const r = 1 + Math.sqrt(node.edges.length) * 3;
      ctx.arc(node.pos[0], node.pos[1], r, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}

const { canvas, size } = useCanvasDPI();

const graph = new ForceGraph();

onMounted(async () => {
  await nextTick();
  for (let i = 0; i < 60; i++) {
    graph.addRandom(size.height, size.width);
  }
});

useAnimationFrames(({ delta }) => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) return;
  const dt = Math.min(0.016, delta / 1000);

  ctx.save();
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.clearRect(0, 0, size.width, size.height);
  const center = graph.center();
  ctx.translate(-center[0] + size.width / 2, -center[1] + size.height / 2);
  graph.evolve(dt);
  graph.draw(ctx);
  ctx.restore();
});

type GraphNode = {
  id: number;
  pos: vec2;
  edges: number[];
  v: vec2;
};
</script>
