import { LinScale } from '../../utils/LinScale';
import { Vec2 } from '../../utils/Vec2';
import { Entity, SpaceIndex } from './SpaceIndexTypes';

export class GridIndex<T extends Entity> implements SpaceIndex<T> {
  private grid: Map<number, T[]> = new Map();
  private readonly N;
  constructor(private readonly cellSize: number, private readonly gridSize: number) {
    this.N = Math.ceil(gridSize / cellSize);
  }

  insert(entity: T): void {
    const index = this.indexOf(entity.position());
    const bucket = this.grid.get(index);
    if (bucket) {
      bucket.push(entity);
    } else {
      this.grid.set(index, [entity]);
    }
  }

  query(pos: Vec2, r: number): T[] {
    const near: T[] = [];
    for (const { bucket } of this.queryBuckets(pos, r)) {
      for (const entity of bucket) {
        const d = entity.position().sub(pos).length();
        if (d < r) near.push(entity);
      }
    }
    return near;
  }

  private *queryBuckets(pos: Vec2, r: number) {
    const near: T[] = [];
    const min = pos.subScalar(r);
    const max = pos.addScalar(r);
    const xStart = Math.max(0, Math.floor(min.x / this.cellSize));
    const yStart = Math.max(0, Math.floor(min.y / this.cellSize));
    const xEnd = Math.min(this.N - 1, Math.floor(max.x / this.cellSize));
    const yEnd = Math.min(this.N - 1, Math.floor(max.y / this.cellSize));
    for (let i = xStart; i <= xEnd; i++) {
      for (let j = yStart; j <= yEnd; j++) {
        const bucket = this.grid.get(i * this.N + j);
        if (bucket) {
          yield { bucket, x: i * this.cellSize, y: j * this.cellSize };
        }
      }
    }
    return near;
  }

  private indexOf(v: Vec2): number {
    const x = Math.floor(v.x / this.cellSize);
    const y = Math.floor(v.y / this.cellSize);
    return x * this.N + y;
  }

  private bucketOf(entity: T) {
    const index = this.indexOf(entity.position());
    return this.grid.get(index);
  }

  remove(entity: T): void {
    const bucket = this.bucketOf(entity);
    if (bucket) {
      const index = bucket.indexOf(entity);
      if (index !== -1) bucket.splice(index, 1);
    }
  }

  iter() {
    return [...this.grid.values()].flatMap((v) => v);
  }

  drawQuery(pos: Vec2, r: number, ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = 'white';
    const width = ctx.canvas.offsetWidth;
    const height = ctx.canvas.offsetHeight;
    const scaleX = LinScale.fromPoints(0, 0, this.gridSize, width);
    const scaleY = LinScale.fromPoints(0, 0, this.gridSize, height);
    for (let i = 0; i < this.N; i++) {
      for (let j = 0; j < this.N; j++) {
        const x = scaleX.scale(i * this.cellSize);
        const y = scaleY.scale(j * this.cellSize);
        ctx.strokeRect(x, y, scaleX.scale(this.cellSize), scaleY.scale(this.cellSize));
      }
    }

    for (const { x, y, bucket } of this.queryBuckets(pos, r)) {
      ctx.fillStyle = '#fff89644';
      ctx.fillRect(
        scaleX.scale(x),
        scaleY.scale(y),
        scaleX.scale(this.cellSize),
        scaleY.scale(this.cellSize)
      );
    }

    ctx.beginPath();
    ctx.arc(scaleX.scale(pos.x), scaleY.scale(pos.y), scaleX.alpha * r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
