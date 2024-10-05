import { Vec2 } from '../../utils/Vec2';

export interface Entity {
  position(): Vec2;
}

export interface SpaceIndex<T> {
  insert(entity: T): void;
  remove(entity: T): void;
  query(pos: Vec2, r: number): T[];
  iter(): Iterable<T>;
  drawQuery(pos: Vec2, r: number, ctx: CanvasRenderingContext2D): void;
}
