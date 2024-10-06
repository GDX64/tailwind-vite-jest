import { LinScale } from '../../utils/LinScale';
import { Vec2 } from '../../utils/Vec2';
import { Entity, SpaceIndex } from './SpaceIndexTypes';

const MIN_SIZE = 3;

export class QuadTreeIndex<T extends Entity> implements SpaceIndex<T> {
  nw: QuadTreeIndex<T> | null = null;
  ne: QuadTreeIndex<T> | null = null;
  sw: QuadTreeIndex<T> | null = null;
  se: QuadTreeIndex<T> | null = null;

  data: T[] | null = [];

  constructor(private size: number, private origin: Vec2 = Vec2.new(0, 0)) {}

  insert(entity: T): void {
    if ((this.data && !this.data?.length) || this.size <= MIN_SIZE) {
      this.data?.push(entity);
      return;
    }
    const entities = this.data ?? [];
    entities.push(entity);
    this.data = null;
    for (entity of entities) {
      const { x, y } = entity.position();
      const isNW = x < this.origin.x + this.size / 2 && y < this.origin.y + this.size / 2;
      if (isNW) {
        if (this.nw === null) {
          this.nw = new QuadTreeIndex(this.size / 2, this.origin);
        }
        this.nw.insert(entity);
        continue;
      }
      const isNE =
        x >= this.origin.x + this.size / 2 && y < this.origin.y + this.size / 2;
      if (isNE) {
        if (this.ne === null) {
          this.ne = new QuadTreeIndex(
            this.size / 2,
            Vec2.new(this.origin.x + this.size / 2, this.origin.y)
          );
        }
        this.ne.insert(entity);
        continue;
      }
      const isSW =
        x < this.origin.x + this.size / 2 && y >= this.origin.y + this.size / 2;
      if (isSW) {
        if (this.sw === null) {
          this.sw = new QuadTreeIndex(
            this.size / 2,
            Vec2.new(this.origin.x, this.origin.y + this.size / 2)
          );
        }
        this.sw.insert(entity);
        continue;
      }
      //if we got here, it can only be SE
      if (this.se === null) {
        this.se = new QuadTreeIndex(
          this.size / 2,
          Vec2.new(this.origin.x + this.size / 2, this.origin.y + this.size / 2)
        );
      }
      this.se.insert(entity);
    }
  }

  private *allNodes(): Generator<QuadTreeIndex<T>> {
    for (const node of this.children()) {
      yield node;
      yield* node.allNodes();
    }
  }

  drawQuery(pos: Vec2, r: number, ctx: CanvasRenderingContext2D): void {
    ctx.save();
    const scaleX = LinScale.fromPoints(0, 0, this.size, ctx.canvas.offsetWidth);
    const scaleY = LinScale.fromPoints(0, 0, this.size, ctx.canvas.offsetHeight);
    ctx.strokeStyle = 'white';
    for (const node of this.allNodes()) {
      const { x, y } = node.origin;
      ctx.strokeRect(
        scaleX.scale(x),
        scaleY.scale(y),
        scaleX.alpha * node.size,
        scaleX.alpha * node.size
      );
    }

    ctx.beginPath();
    ctx.arc(scaleX.scale(pos.x), scaleY.scale(pos.y), scaleX.alpha * r, 0, Math.PI * 2);
    ctx.stroke();

    // for (const node of this.queryPath(pos, r)) {
    //   const { x, y } = node.origin;
    //   ctx.fillStyle = '#faef7210';
    //   ctx.fillRect(
    //     scaleX.scale(x),
    //     scaleY.scale(y),
    //     scaleX.alpha * node.size,
    //     scaleY.alpha * node.size
    //   );
    // }

    ctx.restore();
  }

  *iter(): Iterable<T> {
    if (this.data) {
      yield* this.data;
      return;
    }
    if (this.ne) {
      yield* this.ne.iter();
    }
    if (this.nw) {
      yield* this.nw.iter();
    }
    if (this.se) {
      yield* this.se.iter();
    }
    if (this.sw) {
      yield* this.sw.iter();
    }
  }

  private contains(pos: Vec2, r: number): boolean {
    const { x, y } = pos;
    return (
      x + r >= this.origin.x &&
      x - r <= this.origin.x + this.size &&
      y + r >= this.origin.y &&
      y - r <= this.origin.y + this.size
    );
  }

  private *children() {
    if (this.nw) yield this.nw;
    if (this.ne) yield this.ne;
    if (this.sw) yield this.sw;
    if (this.se) yield this.se;
  }

  private *queryPath(pos: Vec2, r: number): Generator<QuadTreeIndex<T>> {
    if (this.contains(pos, r)) {
      if (this.data) {
        yield this;
      } else {
        for (const child of this.children()) {
          yield this;
          yield* child.queryTree(pos, r);
        }
      }
    }
  }

  private *queryTree(pos: Vec2, r: number): Generator<QuadTreeIndex<T>> {
    if (this.contains(pos, r)) {
      if (this.data) {
        yield this;
      } else {
        for (const child of this.children()) {
          yield* child.queryTree(pos, r);
        }
      }
    }
  }

  private collectIn(v: T[]) {
    if (this.data) {
      v.push(...this.data);
    } else {
      for (const child of this.children()) {
        child.collectIn(v);
      }
    }
  }

  *query(pos: Vec2, r: number): Generator<T> {
    for (const node of this.queryTree(pos, r)) {
      for (const entity of node.iter()) {
        const d = entity.position().sub(pos).length();
        if (d < r) {
          yield entity;
        }
      }
    }
  }
}
