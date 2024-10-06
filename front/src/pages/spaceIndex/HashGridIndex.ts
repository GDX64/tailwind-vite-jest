import { LinScale } from '../../utils/LinScale';
import { Vec2 } from '../../utils/Vec2';
import { Entity, SpaceIndex } from './SpaceIndexTypes';
import { SpatialGridColors } from './SpatialGridColors';

export class HashGridIndex<T extends Entity> implements SpaceIndex<T> {
  private grid: Map<number, T[]> = new Map();
  private readonly N;
  private readonly CELLS;
  constructor(private readonly cellSize: number, private readonly gridSize: number) {
    this.N = Math.ceil(gridSize / cellSize);
    this.CELLS = 23;
  }

  drawQuery(pos: Vec2, r: number, ctx: CanvasRenderingContext2D): void {
    const visited = this.queryBuckets(pos, r);
    const scaleX = LinScale.fromPoints(0, 0, this.gridSize, ctx.canvas.offsetWidth);
    const scaleY = LinScale.fromPoints(0, 0, this.gridSize, ctx.canvas.offsetHeight);
    ctx.strokeStyle = SpatialGridColors.gridLine;
    for (const { bucket, x, y } of visited) {
      ctx.fillStyle = SpatialGridColors.visitedCell;
      ctx.beginPath();
      ctx.rect(
        scaleX.scale(x),
        scaleY.scale(y),
        scaleX.alpha * this.cellSize,
        scaleY.alpha * this.cellSize
      );
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = SpatialGridColors.visitedCircle;
      for (const entity of bucket) {
        entity.debugDraw(ctx, scaleX, scaleY);
      }
    }

    ctx.beginPath();
    ctx.arc(scaleX.scale(pos.x), scaleY.scale(pos.y), scaleX.alpha * r, 0, Math.PI * 2);
    ctx.stroke();
  }

  iter(): Iterable<T> {
    return [...this.grid.values()].flatMap((v) => v);
  }

  insert(entity: T): void {
    const { x, y } = entity.position();
    const index = this.indexOf(x, y);
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

  private indexOf(x: number, y: number): number {
    const i = Math.floor(x / this.cellSize);
    const j = Math.floor(y / this.cellSize);
    const index = i * this.N + j;
    const result = index % this.CELLS;
    return result;
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
        const x = i * this.cellSize;
        const y = j * this.cellSize;
        const bucketIndex = this.indexOf(x, y);
        const bucket = this.grid.get(bucketIndex) ?? [];
        yield { bucket, x: i * this.cellSize, y: j * this.cellSize };
      }
    }
    return near;
  }

  private bucketOf(entity: T) {}
}

/**
 * fnv32
 */
function hash(x: number): number {
  let h = 2166136261;
  for (let i = 0; i < 4; i++) {
    h ^= (x >> (i * 8)) & 0xff;
    h *= 16777619;
  }
  return h;
}
