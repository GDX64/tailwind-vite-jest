import { lastIndexOf } from 'ramda';
import { Item } from './interfaces';

export function findSelectedPath(
  target: (x: Item) => boolean,
  items: Item[]
): number[] | null {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (target(item)) {
      return [i];
    }
    if (item.items) {
      const path = findSelectedPath(target, item.items);
      if (path) {
        return [i, ...path];
      }
    }
  }
  return null;
}

export function findSelected(path: number[], items: (Item | undefined)[]): Item | null {
  const [head, ...tail] = path;
  if (tail.length === 0 && items[head]) {
    return items[head]!;
  }
  if (head != null && items[head]?.items) {
    return findSelected(tail, items[head]!.items!);
  }
  return null;
}

export class MenuTree {
  path: number[] = [];
  constructor(private items: Item[]) {}

  action(fn: (path: number[], lastIndex: number) => number[]) {
    const lastIndex = this.path.at(-1) ?? -1;
    const newPath = fn(this.path, lastIndex);
    const item = findSelected(newPath, this.items);
    if (item) {
      this.path = newPath;
      return true;
    }
    return false;
  }

  goDown() {
    return this.action((path, last) => [...path.slice(0, -1), last + 1]);
  }

  goUp() {
    return this.action((path, last) => [...path.slice(0, -1), last - 1]);
  }

  goRight() {
    return this.action((path, last) => [...path, 0]);
  }

  goLeft() {
    return this.action((path, last) => path.slice(0, -1));
  }
}
