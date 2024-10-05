import { LinScale } from '../../utils/LinScale';
import { Vec2 } from '../../utils/Vec2';
import { Entity, SpaceIndex } from './SpaceIndexTypes';

export class GridIndex<T extends Entity> implements SpaceIndex<T> {
  private grid: T[][];
  private readonly N;
  constructor(private readonly cellSize: number, private readonly gridSize: number) {
    this.N = Math.ceil(gridSize / cellSize);
    this.grid = [];
  }

  insert(entity: T): void {
    const index = this.indexOf(entity.position());
    const bucket = this.grid.at(index);
    if (bucket) {
      bucket.push(entity);
    } else {
      this.grid[index] = [entity];
    }
  }

  query(pos: Vec2, r: number): T[] {
    const near: T[] = [];
    const index = this.indexOf(pos);
    const bucket = this.grid.at(index);
    return bucket ?? [];
  }

  private indexOf(v: Vec2): number {
    const x = Math.floor(v.x / this.cellSize);
    const y = Math.floor(v.y / this.cellSize);
    return x * this.N + y;
  }

  private bucketOf(entity: T) {
    const index = this.indexOf(entity.position());
    return this.grid.at(index);
  }

  remove(entity: T): void {
    const bucket = this.bucketOf(entity);
    if (bucket) {
      const index = bucket.indexOf(entity);
      if (index !== -1) bucket.splice(index, 1);
    }
  }

  iter() {
    return this.grid.flatMap((v) => v);
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

    ctx.beginPath();
    ctx.arc(scaleX.scale(pos.x), scaleY.scale(pos.y), scaleX.alpha * r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
